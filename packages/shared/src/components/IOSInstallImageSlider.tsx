"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "../i18n/context";

const images = [
  { src: "/images/pwa/pwa-ios.webp", altKey: "install.ios.imageAlt" as const },
  {
    src: "/images/pwa/pwa-ios1.webp",
    altKey: "install.ios.imageAlt1" as const,
  },
  {
    src: "/images/pwa/pwa-ios2.webp",
    altKey: "install.ios.imageAlt2" as const,
  },
];

const SWIPE_THRESHOLD = 50;

export function IOSInstallImageSlider() {
  const t = useT();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (index: number) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  return (
    <div className="w-full">
      <div
        className="w-full overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (dx < -SWIPE_THRESHOLD) goTo(currentIndex + 1);
          else if (dx > SWIPE_THRESHOLD) goTo(currentIndex - 1);
          touchStartX.current = null;
        }}
      >
        <div
          className="flex items-start transition-transform duration-300 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
          }}
        >
          {images.map((image) => (
            <div
              key={image.src}
              className="flex shrink-0 items-start justify-center"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={image.src}
                alt={t(image.altKey)}
                width={200}
                height={267}
                className="h-auto max-w-[200px] rounded-lg border border-line shadow-md"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          className="grid size-8 place-items-center border border-line text-muted transition-colors hover:border-white/28 hover:text-ink"
          aria-label={t("install.ios.prevImage")}
          onClick={() => goTo(currentIndex - 1)}
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
        <div className="flex items-center gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`size-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-accent" : "bg-line"
              }`}
              aria-label={`${t("install.ios.imageAlt")} ${index + 1}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="grid size-8 place-items-center border border-line text-muted transition-colors hover:border-white/28 hover:text-ink"
          aria-label={t("install.ios.nextImage")}
          onClick={() => goTo(currentIndex + 1)}
        >
          <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
