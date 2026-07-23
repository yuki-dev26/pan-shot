"use client";

import { useRef, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useT } from "../i18n/context";
import type { Point } from "../lib/types";

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
  const t = useT();
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
    <div className="relative grid min-h-[min(48vh,420px)] w-full place-items-center p-3 sm:min-h-[min(56vh,560px)] sm:p-4 md:min-h-[min(62vh,640px)]">
      <div
        className="relative max-h-[min(44vh,400px)] max-w-full cursor-crosshair touch-manipulation leading-0 sm:max-h-[min(52vh,540px)] md:max-h-[min(58vh,600px)]"
        ref={frameRef}
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt={t("zoom.pickerAlt")}
          className="block h-auto max-h-[min(44vh,400px)] w-auto max-w-full select-none sm:max-h-[min(52vh,540px)] md:max-h-[min(58vh,600px)]"
          draggable={false}
        />
        {focusPoints.map((point, i) => {
          const Arrow = i === 0 ? ArrowRight : ArrowLeft;
          const active = i === activeIndex;
          return (
            <span
              key={i}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
              aria-hidden
            >
              <span
                className={`grid size-8 place-items-center rounded-full border-2 border-white font-display text-sm font-extrabold text-on-accent shadow-[0_4px_16px_rgb(0_0_0/0.45)] sm:size-[1.85rem] ${
                  i === 0 ? "bg-accent-2" : "bg-accent"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`absolute top-1/2 -translate-y-1/2 ${
                  i === 0 ? "left-full ml-0.5" : "right-full mr-0.5"
                }`}
              >
                <Arrow
                  className={`block size-3.5 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.75)] ${
                    active
                      ? i === 0
                        ? "animate-nudge-right"
                        : "animate-nudge-left"
                      : ""
                  }`}
                  strokeWidth={2.75}
                />
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
