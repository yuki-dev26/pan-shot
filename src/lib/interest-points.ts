import type { Point } from "./types";

export type { Point };

export function findInterestPoints(
  image: HTMLImageElement,
  count = 2,
): Point[] {
  const sampleW = 120;
  const sampleH = Math.max(
    60,
    Math.round((sampleW * image.naturalHeight) / image.naturalWidth),
  );

  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return defaultPoints(count);
  }

  ctx.drawImage(image, 0, 0, sampleW, sampleH);
  const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

  const gridX = 6;
  const gridY = 6;
  const cellW = Math.floor(sampleW / gridX);
  const cellH = Math.floor(sampleH / gridY);
  const scores: { x: number; y: number; score: number }[] = [];

  for (let gy = 0; gy < gridY; gy++) {
    for (let gx = 0; gx < gridX; gx++) {
      if (gx === 0 || gy === 0 || gx === gridX - 1 || gy === gridY - 1) {
        continue;
      }

      let edge = 0;
      let samples = 0;
      const x0 = gx * cellW;
      const y0 = gy * cellH;

      for (let y = y0 + 1; y < y0 + cellH - 1; y += 2) {
        for (let x = x0 + 1; x < x0 + cellW - 1; x += 2) {
          const i = (y * sampleW + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          const iR = (y * sampleW + (x + 1)) * 4;
          const iD = ((y + 1) * sampleW + x) * 4;
          const lumR =
            0.299 * data[iR] + 0.587 * data[iR + 1] + 0.114 * data[iR + 2];
          const lumD =
            0.299 * data[iD] + 0.587 * data[iD + 1] + 0.114 * data[iD + 2];

          edge += Math.abs(lum - lumR) + Math.abs(lum - lumD);
          samples++;
        }
      }

      const cx = (x0 + cellW / 2) / sampleW;
      const cy = (y0 + cellH / 2) / sampleH;
      const thirdsBoost =
        1 +
        0.25 *
          (1 - Math.min(Math.abs(cx - 1 / 3), Math.abs(cx - 2 / 3)) * 3) *
          (1 - Math.min(Math.abs(cy - 1 / 3), Math.abs(cy - 2 / 3)) * 3);

      scores.push({
        x: cx,
        y: cy,
        score: (samples ? edge / samples : 0) * thirdsBoost,
      });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  const picked: Point[] = [];
  const minDist = 0.22;

  for (const candidate of scores) {
    if (
      picked.every(
        (p) =>
          Math.hypot(p.x - candidate.x, p.y - candidate.y) >= minDist,
      )
    ) {
      picked.push({ x: candidate.x, y: candidate.y });
    }
    if (picked.length >= count) break;
  }

  while (picked.length < count) {
    picked.push(defaultPoints(count)[picked.length]);
  }

  return picked;
}

function defaultPoints(count: number): Point[] {
  const presets: Point[] = [
    { x: 0.33, y: 0.32 },
    { x: 0.68, y: 0.38 },
    { x: 0.5, y: 0.55 },
    { x: 0.28, y: 0.62 },
    { x: 0.72, y: 0.58 },
  ];
  return presets.slice(0, count);
}
