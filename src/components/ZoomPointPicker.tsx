"use client";

import { useRef, type MouseEvent } from "react";
import type { Point } from "@/lib/types";

type Props = {
  imageUrl: string;
  focusPoints: [Point, Point];
  activeIndex: 0 | 1;
  onPick: (index: 0 | 1, point: Point) => void;
};

export function ZoomPointPicker({
  imageUrl,
  focusPoints,
  activeIndex,
  onPick,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    onPick(activeIndex, {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    });
  }

  return (
    <div className="relative grid min-h-[min(62vh,640px)] w-full place-items-center p-4">
      <div
        className="relative max-h-[min(58vh,600px)] max-w-full cursor-crosshair leading-0"
        ref={frameRef}
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt="ズーム位置を選ぶ画像"
          className="block h-auto max-h-[min(58vh,600px)] w-auto max-w-full select-none"
          draggable={false}
        />
        {focusPoints.map((point, i) => (
          <span
            key={i}
            className={`pointer-events-none absolute grid size-[1.85rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white font-display text-sm font-extrabold text-on-accent shadow-[0_4px_16px_rgb(0_0_0/0.45)] transition-[transform,background] duration-200 ${
              i === activeIndex
                ? "scale-110 bg-accent"
                : "bg-accent-2"
            }`}
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
            aria-hidden
          >
            {i + 1}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3.5 left-3.5 text-xs tracking-wide text-white/70">
        クリックで {activeIndex + 1} 箇所目を置く
      </div>
    </div>
  );
}
