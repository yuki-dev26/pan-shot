import fixWebmDuration from "fix-webm-duration";
import {
  buildTimeline,
  outputSize,
  renderAtTime,
  timelineDuration,
  type RenderOptions,
} from "./cinematic-renderer";
import type { Point } from "./types";

export type ExportProgress = {
  phase: "rendering" | "encoding" | "done";
  progress: number;
};

const EXPORT_MAX_SIDE = 1920;

const WEBM_MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

const MP4_MIME_CANDIDATES = [
  'video/mp4;codecs="avc1.42E01E"',
  "video/mp4;codecs=avc1",
  "video/mp4",
] as const;

function prefersMp4Export(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function pickMimeType(): string {
  // iPhone 等は WebM 再生が弱いので MP4 を優先
  const candidates = prefersMp4Export()
    ? [...MP4_MIME_CANDIDATES, ...WEBM_MIME_CANDIDATES]
    : [...WEBM_MIME_CANDIDATES, ...MP4_MIME_CANDIDATES];

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

export async function exportCinematicVideo(
  image: HTMLImageElement,
  options: RenderOptions,
  onProgress?: (p: ExportProgress) => void,
  signal?: AbortSignal,
): Promise<{ blob: Blob; mimeType: string }> {
  const fps = options.fps ?? 30;
  const size =
    options.width != null && options.height != null
      ? { width: options.width, height: options.height }
      : outputSize(image, EXPORT_MAX_SIDE);
  const { width, height } = size;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Canvas を初期化できませんでした");
  }

  const segments = buildTimeline(options.focusPoints, options.mirrorPan);
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

  renderAtTime(ctx, image, segments, 0, width, height);
  recorder.start();

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

    const target = startedAt + (i + 1) * frameInterval;
    const wait = target - performance.now();
    if (wait > 1) {
      await sleep(wait);
    } else {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
  }

  onProgress?.({ phase: "encoding", progress: 1 });

  await sleep(frameInterval + 80);
  if (recorder.state !== "inactive") recorder.stop();
  stream.getTracks().forEach((t) => t.stop());

  let blob = await stopped;

  if (mimeType.includes("webm")) {
    const durationMs = (totalFrames / fps) * 1000;
    blob = await fixWebmDuration(blob, durationMs, { logger: false });
  }

  onProgress?.({ phase: "done", progress: 1 });
  return { blob, mimeType };
}

export async function previewLoop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  focusPoints: [Point, Point],
  signal: AbortSignal,
  mirrorPan = false,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const { width, height } = outputSize(image, 960);
  canvas.width = width;
  canvas.height = height;

  const segments = buildTimeline(focusPoints, mirrorPan);
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
