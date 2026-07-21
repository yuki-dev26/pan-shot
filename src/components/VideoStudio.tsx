"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Download,
  ImageUp,
  LoaderCircle,
  Play,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { ZoomPointPicker } from "@/components/ZoomPointPicker";
import { useT } from "@/i18n/context";
import { loadImage } from "@/lib/image";
import { findInterestPoints } from "@/lib/interest-points";
import type { Point } from "@/lib/types";
import {
  exportCinematicVideo,
  extensionForMime,
  previewLoop,
} from "@/lib/video-exporter";

const DEFAULT_POINTS: [Point, Point] = [
  { x: 0.33, y: 0.35 },
  { x: 0.68, y: 0.42 },
];

const previewMinH = "min-h-[min(48vh,420px)] sm:min-h-[min(56vh,560px)] md:min-h-[min(62vh,640px)]";
const previewMaxH = "max-h-[min(48vh,420px)] sm:max-h-[min(56vh,560px)] md:max-h-[min(62vh,640px)]";

const btnBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 border border-line bg-transparent px-4 py-3.5 text-center font-sans text-ink no-underline transition-[background,border-color,color,transform] duration-200 touch-manipulation disabled:cursor-not-allowed disabled:opacity-45";
const btnGhost = `${btnBase} hover:border-white/30 hover:bg-white/4 disabled:hover:border-line disabled:hover:bg-transparent`;
const btnPrimary = `${btnBase} border-transparent bg-linear-to-br from-accent via-[#9ccfff] to-accent-2 font-bold tracking-tight text-on-accent hover:-translate-y-px hover:brightness-105 disabled:hover:translate-y-0 disabled:hover:brightness-100`;
const iconClass = "size-4 shrink-0";

export function VideoStudio() {
  const t = useT();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focusPoints, setFocusPoints] = useState<[Point, Point]>(DEFAULT_POINTS);
  const [activePoint, setActivePoint] = useState<0 | 1>(0);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("panshot.webm");
  const [fileName, setFileName] = useState("panshot");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    videoUrlRef.current = videoUrl;
  }, [videoUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current || viewMode !== "preview") return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void previewLoop(canvasRef.current, image, focusPoints, controller.signal);

    return () => controller.abort();
  }, [image, focusPoints, viewMode]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      abortRef.current?.abort();
      exportAbortRef.current?.abort();
    };
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("errors.notImage"));
      return;
    }

    setError(null);
    setStatus(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      const { image: img, url } = await loadImage(file);
      const auto = findInterestPoints(img);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      startTransition(() => {
        setImage(img);
        setPreviewUrl(url);
        setFocusPoints([auto[0], auto[1]]);
        setActivePoint(0);
        setViewMode("edit");
        setFileName(file.name.replace(/\.[^.]+$/, "") || "panshot");
      });
    } catch {
      setError(t("errors.loadFailed"));
    }
  }

  function handlePick(index: 0 | 1, point: Point) {
    setFocusPoints((prev) => {
      const next: [Point, Point] = [...prev];
      next[index] = point;
      return next;
    });
  }

  async function handleExport() {
    if (!image || exporting) return;

    exportAbortRef.current?.abort();
    const controller = new AbortController();
    exportAbortRef.current = controller;

    setExporting(true);
    setProgress(0);
    setError(null);
    setStatus(t("status.exporting"));
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      const { blob, mimeType } = await exportCinematicVideo(
        image,
        { focusPoints, fps: 30 },
        (p) => {
          setProgress(p.progress);
          if (p.phase === "encoding") setStatus(t("status.encoding"));
        },
        controller.signal,
      );

      const url = URL.createObjectURL(blob);
      const name = `${fileName}-panshot.${extensionForMime(mimeType)}`;
      setVideoUrl(url);
      setDownloadName(name);
      setStatus(
        t("status.done", { ext: extensionForMime(mimeType).toUpperCase() }),
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStatus(t("status.cancelled"));
      } else {
        setError(e instanceof Error ? e.message : t("errors.exportFailed"));
        setStatus(null);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid animate-rise grid-cols-1 items-start gap-[clamp(1rem,2.5vw,1.75rem)] [animation-delay:80ms] md:grid-cols-[1.4fr_0.8fr]">
      <div
        className={`relative ${previewMinH} overflow-hidden border border-line bg-bg-1 outline-none transition-[border-color,box-shadow,transform] duration-300 ${
          image
            ? ""
            : "grid cursor-pointer place-items-center bg-linear-to-b from-white/3 to-transparent"
        } ${
          dragging
            ? "scale-[1.01] border-accent/55 shadow-[0_0_0_1px_rgb(110_182_255/0.2),0_20px_60px_rgb(110_182_255/0.18)]"
            : ""
        } ${
          !image
            ? "hover:border-accent/55 hover:shadow-[0_0_0_1px_rgb(110_182_255/0.2),0_20px_60px_rgb(110_182_255/0.18)]"
            : ""
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => {
          if (!image) inputRef.current?.click();
        }}
        role={image ? undefined : "button"}
        tabIndex={image ? undefined : 0}
        onKeyDown={(e) => {
          if (!image && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {!image || !previewUrl ? (
          <div className="grid justify-items-center gap-2 px-5 py-8 text-center sm:p-8">
            <span
              className="mb-2 grid size-13 place-items-center border border-line text-accent animate-pulse-ring"
              aria-hidden
            >
              <Upload className="size-6" strokeWidth={1.75} />
            </span>
            <p className="m-0 font-display text-xl tracking-tight sm:text-2xl">
              {t("upload.title")}
            </p>
            <p className="m-0 text-[0.9rem] text-muted sm:text-[0.95rem]">
              {t("upload.formats")}
            </p>
          </div>
        ) : viewMode === "edit" ? (
          <div
            className={`relative grid ${previewMinH} w-full place-items-center bg-[#0a0c10]`}
          >
            <ZoomPointPicker
              imageUrl={previewUrl}
              focusPoints={focusPoints}
              activeIndex={activePoint}
              onPick={handlePick}
            />
          </div>
        ) : (
          <div
            className={`relative grid ${previewMinH} w-full place-items-center bg-black`}
          >
            <canvas
              ref={canvasRef}
              className={`block h-auto ${previewMaxH} w-auto max-w-full`}
            />
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end gap-3 text-[0.65rem] tracking-[0.12em] text-white/70 uppercase sm:inset-x-3.5 sm:bottom-3.5 sm:text-[0.72rem]">
              <span>
                {image.naturalWidth}×{image.naturalHeight}
              </span>
            </div>
          </div>
        )}
      </div>

      <aside className="grid gap-4 border border-line bg-bg-1/72 p-4 backdrop-blur-md sm:gap-5 sm:p-5">
        {image && (
          <div className="grid gap-3">
            <p className="m-0 text-xs tracking-[0.14em] text-muted uppercase">
              {t("view.label")}
            </p>
            <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label={t("view.switchAria")}>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "edit"}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 border px-3.5 py-2.5 font-sans transition-colors duration-200 ${
                  viewMode === "edit"
                    ? "border-accent/55 bg-accent/10 text-ink"
                    : "border-line bg-transparent text-muted"
                }`}
                onClick={() => setViewMode("edit")}
              >
                <ZoomIn className={iconClass} strokeWidth={1.75} aria-hidden />
                {t("view.zoomPoints")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "preview"}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 border px-3.5 py-2.5 font-sans transition-colors duration-200 ${
                  viewMode === "preview"
                    ? "border-accent/55 bg-accent/10 text-ink"
                    : "border-line bg-transparent text-muted"
                }`}
                onClick={() => setViewMode("preview")}
              >
                <Play className={iconClass} strokeWidth={1.75} aria-hidden />
                {t("view.preview")}
              </button>
            </div>
          </div>
        )}

        {image && (
          <div className="grid gap-3">
            <p className="m-0 text-xs tracking-[0.14em] text-muted uppercase">
              {t("zoom.label")}
            </p>
            <div
              className="grid grid-cols-2 gap-1.5"
              role="radiogroup"
              aria-label={t("zoom.editAria")}
            >
              {([0, 1] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={activePoint === i}
                  aria-label={t("zoom.pointAria", { n: i + 1 })}
                  className={`flex cursor-pointer items-center justify-center gap-3 border px-3.5 py-3 font-sans transition-colors duration-200 hover:border-white/28 ${
                    activePoint === i
                      ? "border-white/30 bg-transparent"
                      : "border-line bg-transparent"
                  }`}
                  onClick={() => {
                    setActivePoint(i);
                    setViewMode("edit");
                  }}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold text-on-accent ${
                      i === 0 ? "bg-accent-2" : "bg-accent"
                    }`}
                  >
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
            <p className="m-0 text-sm leading-snug text-muted">
              {t("zoom.hint")}
            </p>
          </div>
        )}

        <div className="grid gap-2.5">
          {image && (
            <button
              type="button"
              className={btnGhost}
              onClick={() => inputRef.current?.click()}
              disabled={exporting}
            >
              <ImageUp className={iconClass} strokeWidth={1.75} aria-hidden />
              {t("actions.changeImage")}
            </button>
          )}
          <button
            type="button"
            className={btnPrimary}
            disabled={!image || exporting}
            onClick={() => void handleExport()}
          >
            {exporting ? (
              <LoaderCircle className={`${iconClass} animate-spin`} strokeWidth={2} aria-hidden />
            ) : (
              <Download className={iconClass} strokeWidth={2} aria-hidden />
            )}
            {exporting ? t("actions.exporting") : t("actions.download")}
          </button>
          {exporting && (
            <button
              type="button"
              className={btnGhost}
              onClick={() => exportAbortRef.current?.abort()}
            >
              <X className={iconClass} strokeWidth={1.75} aria-hidden />
              {t("actions.cancel")}
            </button>
          )}
        </div>

        {(exporting || status || error) && (
          <div className="grid gap-3">
            {exporting && (
              <div className="h-0.5 overflow-hidden bg-white/8" aria-hidden>
                <div
                  className="h-full bg-linear-to-r from-accent to-accent-2 transition-[width] duration-150 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
            {status && <p className="m-0 text-[0.92rem] text-muted">{status}</p>}
            {error && <p className="m-0 text-[0.92rem] text-danger">{error}</p>}
            {videoUrl && !exporting && (
              <a className={`${btnGhost}`} href={videoUrl} download={downloadName}>
                <Download className={iconClass} strokeWidth={1.75} aria-hidden />
                {t("actions.downloadAgain")}
              </a>
            )}
          </div>
        )}

      </aside>
    </div>
  );
}
