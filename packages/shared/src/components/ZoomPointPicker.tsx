"use client";

import { useRef, type PointerEvent, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useT } from "../i18n/context";
import type { Point } from "../lib/types";

type Props = {
  imageUrl: string;
  focusPoints: [Point, Point];
  activeIndex: 0 | 1;
  mirrorPan?: boolean;
  onPick: (index: 0 | 1, point: Point) => void;
  onActiveChange?: (index: 0 | 1) => void;
};

type DragState = {
  index: 0 | 1;
  pointerId: number;
  moved: boolean;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function ZoomPointPicker({
  imageUrl,
  focusPoints,
  activeIndex,
  mirrorPan = false,
  onPick,
  onActiveChange,
}: Props) {
  const t = useT();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  function clientToPoint(
    clientX: number,
    clientY: number,
    { clampOutside }: { clampOutside: boolean },
  ): Point | null {
    const frame = frameRef.current;
    if (!frame) return null;

    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (!clampOutside && (x < 0 || x > 1 || y < 0 || y > 1)) return null;

    return { x: clamp01(x), y: clamp01(y) };
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const point = clientToPoint(e.clientX, e.clientY, { clampOutside: false });
    if (!point) return;
    onPick(activeIndex, point);
  }

  function handleMarkerPointerDown(
    e: PointerEvent<HTMLButtonElement>,
    index: 0 | 1,
  ) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId, moved: false };
    onActiveChange?.(index);
  }

  function handleMarkerPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const point = clientToPoint(e.clientX, e.clientY, { clampOutside: true });
    if (!point) return;

    drag.moved = true;
    onPick(drag.index, point);
  }

  function endMarkerDrag(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (drag.moved) suppressClickRef.current = true;
    dragRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
          const index = i as 0 | 1;
          const goesRight = index === 0 ? !mirrorPan : mirrorPan;
          const Arrow = goesRight ? ArrowRight : ArrowLeft;
          const active = index === activeIndex;
          return (
            <span
              key={index}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
            >
              <button
                type="button"
                className={`grid size-8 cursor-grab place-items-center rounded-full border-2 border-white font-display text-sm font-extrabold text-on-accent shadow-[0_4px_16px_rgb(0_0_0/0.45)] touch-none transition-transform duration-150 active:cursor-grabbing sm:size-[1.85rem] ${
                  index === 0 ? "bg-accent-2" : "bg-accent"
                } ${active ? "scale-110 ring-2 ring-white/70" : ""}`}
                aria-label={t("zoom.pointAria", { n: index + 1 })}
                aria-pressed={active}
                onPointerDown={(e) => handleMarkerPointerDown(e, index)}
                onPointerMove={handleMarkerPointerMove}
                onPointerUp={endMarkerDrag}
                onPointerCancel={endMarkerDrag}
                onClick={(e) => e.stopPropagation()}
              >
                {index + 1}
              </button>
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                  goesRight ? "left-full ml-0.5" : "right-full mr-0.5"
                }`}
                aria-hidden
              >
                <Arrow
                  className={`block size-3.5 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.75)] ${
                    active
                      ? goesRight
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
