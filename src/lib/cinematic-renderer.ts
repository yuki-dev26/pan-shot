import { clamp, easeInOutSine, easeOutSine, lerp } from "./easing";
import type { Point } from "./interest-points";

export type RenderOptions = {
  focusPoints: [Point, Point];
  width?: number;
  height?: number;
  fps?: number;
};

type CameraState = {
  x: number;
  y: number;
  zoom: number;
};

type FrameState = {
  camera: CameraState;
  fade: number;
  blend?: {
    camera: CameraState;
    amount: number;
  };
};

type Segment =
  | {
      kind: "hold";
      duration: number;
      from: CameraState;
      to: CameraState;
      fadeIn?: number;
      fadeOut?: number;
    }
  | {
      kind: "crossfade";
      duration: number;
      fromStart: CameraState;
      fromEnd: CameraState;
      toStart: CameraState;
      toEnd: CameraState;
      /** 入り側だけゆっくり引く（フェードと同時） */
      easeToCamera?: boolean;
      blendSoftness?: number;
      /**
       * ブレンドをセグメント前半のこの割合で完了させる。
       * 例: 0.2 → 最初の20%で切り替え終わり、以降は引きだけ続く
       */
      blendEndAt?: number;
    };

function cam(x: number, y: number, zoom: number): CameraState {
  return { x, y, zoom };
}

function lerpCam(a: CameraState, b: CameraState, t: number): CameraState {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    zoom: lerp(a.zoom, b.zoom, t),
  };
}

function withPan(base: CameraState, panX: number, u: number): CameraState {
  return cam(base.x + (-panX / 2 + panX * u), base.y, base.zoom);
}

function softBlend(p: number, softness = 2): number {
  let t = clamp(p, 0, 1);
  for (let i = 0; i < softness; i++) {
    t = easeInOutSine(t);
  }
  return t;
}

/** フェード中の引き: ゆっくり・着地で減速 */
function easePull(t: number): number {
  return easeOutSine(easeInOutSine(clamp(t, 0, 1)));
}

export function buildTimeline(focusPoints: [Point, Point]): Segment[] {
  const shotA = cam(focusPoints[0].x, focusPoints[0].y, 2.7);
  const shotB = cam(focusPoints[1].x, focusPoints[1].y, 2.55);
  const full = cam(0.5, 0.5, 1);

  // 1: hold + 出口フェード
  // 2: 短く見せる（ホールド短め＋出口はすぐ消す）
  // 最後: 2は早めにフェードアウトし、その後は中央の引きだけ長く
  const holdMs = 1300;
  const xfadeMs = 1200;
  const holdBMs = 480;
  const finaleMs = 5000; // 引きの挙動はそのまま
  // 引き切ったあとを削って合計 8 秒に
  const endingMs = 8000 - (holdMs + xfadeMs + holdBMs + finaleMs); // 20ms
  // 引き尺のうち、2→全体のフェードに使う時間（これ以上2を残さない）
  const finaleBlendMs = 1200;

  const panA = 0.024;
  const panB = -0.024;

  const unitMs = holdMs + xfadeMs;
  const u = (ms: number) => ms / unitMs;

  const a0 = withPan(shotA, panA, 0);
  const aHoldEnd = withPan(shotA, panA, u(holdMs));
  const aEnd = withPan(shotA, panA, u(holdMs + xfadeMs));

  const b0 = withPan(shotB, panB, 0);
  const bAfterEnter = withPan(shotB, panB, u(xfadeMs));
  const bHoldEnd = withPan(shotB, panB, u(xfadeMs + holdBMs));
  // 2 のスライドはフェードアウト完了までにだけ伸ばす（finale 全体ではない）
  const bExitEnd = withPan(shotB, panB, u(xfadeMs + holdBMs + finaleBlendMs));

  const fullNear = cam(0.5, 0.5, 1.06);
  const fullFar = cam(0.5, 0.5, 1);

  return [
    {
      kind: "hold",
      duration: holdMs,
      from: a0,
      to: aHoldEnd,
      fadeIn: 0.38,
    },
    {
      kind: "crossfade",
      duration: xfadeMs,
      fromStart: aHoldEnd,
      fromEnd: aEnd,
      toStart: b0,
      toEnd: bAfterEnter,
    },
    {
      kind: "hold",
      duration: holdBMs,
      from: bAfterEnter,
      to: bHoldEnd,
    },
    {
      // 序盤で2を消して、残りは中央のゆっくり引きだけ
      kind: "crossfade",
      duration: finaleMs,
      fromStart: bHoldEnd,
      fromEnd: bExitEnd,
      toStart: fullNear,
      toEnd: fullFar,
      easeToCamera: true,
      blendSoftness: 2,
      blendEndAt: finaleBlendMs / finaleMs,
    },
    {
      kind: "hold",
      duration: endingMs,
      from: fullFar,
      to: full,
      fadeOut: 0.14,
    },
  ];
}

export function timelineDuration(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + s.duration, 0);
}

function sampleFrame(segments: Segment[], timeMs: number): FrameState {
  let t = timeMs;
  for (const seg of segments) {
    if (t > seg.duration) {
      t -= seg.duration;
      continue;
    }

    const p = seg.duration === 0 ? 1 : clamp(t / seg.duration, 0, 1);

    if (seg.kind === "hold") {
      let fade = 0;
      if (seg.fadeIn && p < seg.fadeIn) {
        fade = 1 - easeInOutSine(p / seg.fadeIn);
      } else if (seg.fadeOut && p > 1 - seg.fadeOut) {
        fade = easeInOutSine((p - (1 - seg.fadeOut)) / seg.fadeOut);
      }

      return {
        camera: lerpCam(seg.from, seg.to, p),
        fade,
      };
    }

    const toT = seg.easeToCamera ? easePull(p) : p;
    const blendEndAt = seg.blendEndAt ?? 1;
    const blendP = blendEndAt >= 1 ? p : clamp(p / blendEndAt, 0, 1);
    // from のパンもフェード完了までに合わせる（消えたあとに動かさない）
    const fromT = blendEndAt >= 1 ? p : clamp(p / blendEndAt, 0, 1);
    const blend = softBlend(blendP, seg.blendSoftness ?? 2);
    return {
      camera: lerpCam(seg.fromStart, seg.fromEnd, fromT),
      fade: 0,
      blend: {
        camera: lerpCam(seg.toStart, seg.toEnd, toT),
        amount: blend,
      },
    };
  }

  const last = segments[segments.length - 1];
  return {
    camera: last.kind === "hold" ? last.to : last.toEnd,
    fade: 0,
  };
}

function drawCamera(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  camera: CameraState,
) {
  const fit = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const scale = fit * camera.zoom;
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;

  const maxOffsetX = Math.max(0, (drawW - width) / 2);
  const maxOffsetY = Math.max(0, (drawH - height) / 2);

  let ox = (0.5 - camera.x) * drawW;
  let oy = (0.5 - camera.y) * drawH;
  ox = clamp(ox, -maxOffsetX, maxOffsetX);
  oy = clamp(oy, -maxOffsetY, maxOffsetY);

  ctx.drawImage(
    image,
    (width - drawW) / 2 + ox,
    (height - drawH) / 2 + oy,
    drawW,
    drawH,
  );
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  state: FrameState,
) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawCamera(ctx, image, width, height, state.camera);

  if (state.blend && state.blend.amount > 0) {
    ctx.globalAlpha = clamp(state.blend.amount, 0, 1);
    drawCamera(ctx, image, width, height, state.blend.camera);
    ctx.globalAlpha = 1;
  }

  if (state.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${clamp(state.fade, 0, 1)})`;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

export function renderAtTime(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  segments: Segment[],
  timeMs: number,
  width: number,
  height: number,
) {
  drawFrame(ctx, image, width, height, sampleFrame(segments, timeMs));
}

export function outputSize(
  image: HTMLImageElement,
  maxSide = 1280,
): { width: number; height: number } {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(iw, ih));
  const width = Math.max(2, Math.round((iw * scale) / 2) * 2);
  const height = Math.max(2, Math.round((ih * scale) / 2) * 2);
  return { width, height };
}
