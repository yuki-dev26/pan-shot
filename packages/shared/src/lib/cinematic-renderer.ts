import { clamp, easeInOutSine, easeOutSine, lerp } from "./easing";
import type { Point } from "./types";

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
      easeToCamera?: boolean;
      blendSoftness?: number;
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

function easePull(t: number): number {
  return easeOutSine(easeInOutSine(clamp(t, 0, 1)));
}

export function buildTimeline(focusPoints: [Point, Point]): Segment[] {
  const shotZoom = 2.65;
  const shotA = cam(focusPoints[0].x, focusPoints[0].y, shotZoom);
  const shotB = cam(focusPoints[1].x, focusPoints[1].y, shotZoom);
  const full = cam(0.5, 0.5, 1);

  const totalMs = 8000;
  const holdMs = 1300;
  const xfadeMs = 1200;
  const holdBMs = 480;
  const endingMs = 1500;
  const finaleMs = totalMs - (holdMs + xfadeMs + holdBMs + endingMs);
  const finaleBlendMs = 1200;

  const panAmount = 0.05;
  const panA = panAmount;
  const panB = -panAmount * 0.7;

  const unitMs = holdMs + xfadeMs;
  const u = (ms: number) => ms / unitMs;

  const a0 = withPan(shotA, panA, 0);
  const aHoldEnd = withPan(shotA, panA, u(holdMs));
  const aEnd = withPan(shotA, panA, u(holdMs + xfadeMs));

  const b0 = withPan(shotB, panB, 0);
  const bAfterEnter = withPan(shotB, panB, u(xfadeMs));
  const bHoldEnd = withPan(shotB, panB, u(xfadeMs + holdBMs));
  const bExitEnd = withPan(
    shotB,
    panB,
    u(xfadeMs + holdBMs + finaleBlendMs),
  );

  const fullNear = cam(0.5, 0.5, 1.06);

  return [
    {
      kind: "hold",
      duration: holdMs,
      from: a0,
      to: aHoldEnd,
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
      kind: "crossfade",
      duration: finaleMs,
      fromStart: bHoldEnd,
      fromEnd: bExitEnd,
      toStart: fullNear,
      toEnd: full,
      easeToCamera: true,
      blendSoftness: 2,
      blendEndAt: finaleBlendMs / finaleMs,
    },
    {
      kind: "hold",
      duration: endingMs,
      from: full,
      to: full,
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
    const fromT = blendEndAt >= 1 ? p : clamp(p / blendEndAt, 0, 1);
    const blend = softBlend(fromT, seg.blendSoftness ?? 2);
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

type BlendLayer = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

/** 出力 canvas ごとに独立させ、プレビューと書き出しの同時実行で干渉しないようにする */
const blendByTarget = new WeakMap<CanvasRenderingContext2D, BlendLayer>();

function getBlendBuffer(
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
): BlendLayer {
  const existing = blendByTarget.get(targetCtx);
  if (
    existing &&
    existing.canvas.width === width &&
    existing.canvas.height === height
  ) {
    return existing;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("ブレンド用 Canvas を初期化できませんでした");
  }
  const layer = { canvas, ctx };
  blendByTarget.set(targetCtx, layer);
  return layer;
}

function paintOpaqueCamera(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  camera: CameraState,
) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawCamera(ctx, image, width, height, camera);
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  state: FrameState,
) {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  paintOpaqueCamera(ctx, image, width, height, state.camera);

  if (state.blend && state.blend.amount > 0) {
    const amount = clamp(state.blend.amount, 0, 1);
    const { canvas: layer, ctx: layerCtx } = getBlendBuffer(ctx, width, height);
    paintOpaqueCamera(layerCtx, image, width, height, state.blend.camera);
    ctx.globalAlpha = amount;
    ctx.drawImage(layer, 0, 0);
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
  maxSide?: number,
): { width: number; height: number } {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const scale =
    maxSide == null ? 1 : Math.min(1, maxSide / Math.max(iw, ih));
  const width = Math.max(2, Math.round((iw * scale) / 2) * 2);
  const height = Math.max(2, Math.round((ih * scale) / 2) * 2);
  return { width, height };
}
