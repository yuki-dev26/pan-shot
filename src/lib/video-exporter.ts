import {
  buildTimeline,
  outputSize,
  renderAtTime,
  timelineDuration,
  type RenderOptions,
} from "./cinematic-renderer";
import type { Point } from "./interest-points";

export type ExportProgress = {
  phase: "rendering" | "encoding" | "done";
  progress: number;
};

function pickMimeType(): string {
  // 使えるなら MP4、だめなら WebM
  const candidates = [
    'video/mp4;codecs="avc1.42E01E"',
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "";
}

export function extensionForMime(mime: string): string {
  if (mime.includes("mp4")) return "mp4";
  return "webm";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * プレビューと同じタイムラインを、実時間どおりに焼き付けて動画化する。
 * （速く描画しすぎると MediaRecorder の尺が短くなるため、フレーム間隔を待つ）
 */
export async function exportCinematicVideo(
  image: HTMLImageElement,
  options: RenderOptions,
  onProgress?: (p: ExportProgress) => void,
  signal?: AbortSignal,
): Promise<{ blob: Blob; mimeType: string }> {
  const fps = options.fps ?? 30;
  // 解像度は指定がなければ元画像のまま（縮小しない）
  const size =
    options.width != null && options.height != null
      ? { width: options.width, height: options.height }
      : outputSize(image);
  const width = size.width;
  const height = size.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Canvas を初期化できませんでした");
  }

  const segments = buildTimeline(options.focusPoints);
  const duration = timelineDuration(segments);
  const totalFrames = Math.max(1, Math.round((duration / 1000) * fps));
  const frameInterval = 1000 / fps;

  const mimeType = pickMimeType();
  if (!mimeType) {
    throw new Error("このブラウザは動画録画に対応していません");
  }

  const probeStream = canvas.captureStream(0);
  const probeTrack = probeStream.getVideoTracks()[0] as MediaStreamTrack & {
    requestFrame?: () => void;
  };
  const useManualFrames = typeof probeTrack.requestFrame === "function";
  probeStream.getTracks().forEach((t) => t.stop());

  const stream = canvas.captureStream(useManualFrames ? 0 : fps);
  // 解像度に応じてビットレートを上げ、圧縮劣化を抑える
  const pixels = width * height;
  const videoBitsPerSecond = Math.min(
    40_000_000,
    Math.max(12_000_000, Math.round(pixels * 0.12)),
  );

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("録画中にエラーが発生しました"));
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
    };
  });

  // 先頭フレームを先に描いてから録画開始
  renderAtTime(ctx, image, segments, 0, width, height);
  recorder.start(200);

  const videoTrack = stream.getVideoTracks()[0] as MediaStreamTrack & {
    requestFrame?: () => void;
  };
  videoTrack.requestFrame?.();

  const startedAt = performance.now();

  for (let i = 0; i < totalFrames; i++) {
    if (signal?.aborted) {
      if (recorder.state !== "inactive") recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
      throw new DOMException("Aborted", "AbortError");
    }

    const timeMs = Math.min(duration - 0.001, (i / totalFrames) * duration);
    renderAtTime(ctx, image, segments, timeMs, width, height);
    videoTrack.requestFrame?.();

    onProgress?.({
      phase: "rendering",
      progress: (i + 1) / totalFrames,
    });

    // プレビューと同じ実時間で進める（これが尺ズレ防止の要点）
    const target = startedAt + (i + 1) * frameInterval;
    const wait = target - performance.now();
    if (wait > 1) {
      await sleep(wait);
    } else {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
  }

  onProgress?.({ phase: "encoding", progress: 1 });

  // 末尾フレームを確実に取り込む
  await sleep(frameInterval + 80);
  if (recorder.state !== "inactive") recorder.stop();
  stream.getTracks().forEach((t) => t.stop());

  const blob = await stopped;
  onProgress?.({ phase: "done", progress: 1 });
  return { blob, mimeType };
}

export async function previewLoop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  focusPoints: [Point, Point],
  signal: AbortSignal,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const { width, height } = outputSize(image, 960);
  canvas.width = width;
  canvas.height = height;

  const segments = buildTimeline(focusPoints);
  const duration = timelineDuration(segments);
  let start: number | null = null;

  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      if (start === null) start = now;
      const elapsed = (now - start) % duration;
      renderAtTime(ctx, image, segments, elapsed, width, height);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
