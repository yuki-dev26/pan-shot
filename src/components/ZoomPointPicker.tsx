"use client";

import { useRef, type MouseEvent } from "react";
import type { Point } from "@/lib/interest-points";

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
    <div className="picker">
      <div className="picker-frame" ref={frameRef} onClick={handleClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="ズーム位置を選ぶ画像"
          className="picker-image"
          draggable={false}
        />
        {focusPoints.map((point, i) => (
          <span
            key={i}
            className={`picker-pin ${i === activeIndex ? "is-active" : ""}`}
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
            aria-hidden
          >
            {i + 1}
          </span>
        ))}
      </div>
      <div className="picker-hint">クリックで {activeIndex + 1} 箇所目を置く</div>
    </div>
  );
}
