"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { findInterestPoints, type Point } from "@/lib/interest-points";
import {
  exportCinematicVideo,
  extensionForMime,
  previewLoop,
} from "@/lib/video-exporter";
import { ZoomPointPicker } from "@/components/ZoomPointPicker";

const DEFAULT_POINTS: [Point, Point] = [
  { x: 0.33, y: 0.35 },
  { x: 0.68, y: 0.42 },
];

function loadImage(
  file: File,
): Promise<{ image: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ image: img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

export function VideoStudio() {
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
  const [downloadName, setDownloadName] = useState("baeru-baeru.webm");
  const [fileName, setFileName] = useState("baeru");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);

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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      abortRef.current?.abort();
      exportAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選んでください");
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
      const auto = findInterestPoints(img, 2);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      startTransition(() => {
        setImage(img);
        setPreviewUrl(url);
        setFocusPoints([auto[0], auto[1]]);
        setActivePoint(0);
        setViewMode("edit");
        setFileName(file.name.replace(/\.[^.]+$/, "") || "baeru");
      });
    } catch {
      setError("画像の読み込みに失敗しました");
    }
  }

  function handlePick(index: 0 | 1, point: Point) {
    setFocusPoints((prev) => {
      const next: [Point, Point] = [...prev];
      next[index] = point;
      return next;
    });
    if (index === 0) setActivePoint(1);
  }

  async function handleExport() {
    if (!image || exporting) return;

    exportAbortRef.current?.abort();
    const controller = new AbortController();
    exportAbortRef.current = controller;

    setExporting(true);
    setProgress(0);
    setError(null);
    setStatus("プレビューと同じ内容を書き出しています…（実時間かかります）");
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
          if (p.phase === "encoding") setStatus("ファイルをまとめています…");
        },
        controller.signal,
      );

      const url = URL.createObjectURL(blob);
      const name = `${fileName}-baeru.${extensionForMime(mimeType)}`;
      setVideoUrl(url);
      setDownloadName(name);
      setStatus(`完成（${extensionForMime(mimeType).toUpperCase()}）。ダウンロードできます`);

      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStatus("キャンセルしました");
      } else {
        setError(e instanceof Error ? e.message : "書き出しに失敗しました");
        setStatus(null);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="studio">
      <div
        className={`dropzone ${dragging ? "is-drag" : ""} ${image ? "has-image" : ""}`}
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
          <div className="dropzone-empty">
            <span className="dropzone-mark" aria-hidden>
              ＋
            </span>
            <p className="dropzone-title">一枚絵をドロップ</p>
            <p className="dropzone-sub">またはクリックして選択 · PNG / JPG / WEBP</p>
          </div>
        ) : viewMode === "edit" ? (
          <div className="stage stage-edit">
            <ZoomPointPicker
              imageUrl={previewUrl}
              focusPoints={focusPoints}
              activeIndex={activePoint}
              onPick={handlePick}
            />
          </div>
        ) : (
          <div className="stage">
            <canvas ref={canvasRef} className="stage-canvas" />
            <div className="stage-meta">
              <span>LIVE PREVIEW</span>
              <span>
                {image.naturalWidth}×{image.naturalHeight}
              </span>
            </div>
          </div>
        )}
      </div>

      <aside className="panel">
        {image && (
          <div className="panel-block">
            <p className="panel-label">View</p>
            <div className="mode-tabs" role="tablist" aria-label="表示切替">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "edit"}
                className={`mode-tab ${viewMode === "edit" ? "is-active" : ""}`}
                onClick={() => setViewMode("edit")}
              >
                ズーム位置
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "preview"}
                className={`mode-tab ${viewMode === "preview" ? "is-active" : ""}`}
                onClick={() => setViewMode("preview")}
              >
                プレビュー
              </button>
            </div>
          </div>
        )}

        {image && (
          <div className="panel-block">
            <p className="panel-label">Zoom points · 2箇所 → 引き</p>
            <div
              className="point-list"
              role="radiogroup"
              aria-label="編集するズーム位置"
            >
              {([0, 1] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={activePoint === i}
                  className={`point-btn ${activePoint === i ? "is-active" : ""}`}
                  onClick={() => {
                    setActivePoint(i);
                    setViewMode("edit");
                  }}
                >
                  <span className="point-num">{i + 1}</span>
                  <span className="point-meta">
                    <span className="point-name">
                      {i === 0 ? "1箇所目" : "2箇所目"}
                    </span>
                    <span className="point-coords">
                      {Math.round(focusPoints[i].x * 100)}% /{" "}
                      {Math.round(focusPoints[i].y * 100)}%
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p className="point-help">
              プレビューと同じ演出をそのまま動画（MP4 / WebM）に書き出します。
            </p>
          </div>
        )}

        <div className="panel-block actions">
          {image && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => inputRef.current?.click()}
              disabled={exporting}
            >
              画像を差し替え
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!image || exporting}
            onClick={() => void handleExport()}
          >
            {exporting ? "書き出し中…" : "プレビューを動画でDL"}
          </button>
          {exporting && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => exportAbortRef.current?.abort()}
            >
              キャンセル
            </button>
          )}
        </div>

        {(exporting || status || error) && (
          <div className="panel-block status-block">
            {exporting && (
              <div className="progress" aria-hidden>
                <div
                  className="progress-bar"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
            {status && <p className="status">{status}</p>}
            {error && <p className="error">{error}</p>}
            {videoUrl && !exporting && (
              <a
                className="btn btn-ghost download-again"
                href={videoUrl}
                download={downloadName}
              >
                もう一度ダウンロード
              </a>
            )}
          </div>
        )}

        <p className="hint">
          寄り（横流れ）→ フェードで寄り（逆方向）→ ゆっくりフェードで全体。
        </p>
      </aside>
    </div>
  );
}
