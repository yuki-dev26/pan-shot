"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Download,
  LoaderCircle,
  MoreHorizontal,
  Share,
  X,
} from "lucide-react";
import { IOSInstallImageSlider } from "./IOSInstallImageSlider";
import { useT } from "../i18n/context";
import type { PwaInstallState } from "../hooks/usePwaInstall";

function InstallStep({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="grid size-6 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/12 font-display text-xs text-accent"
        aria-hidden
      >
        {number}
      </span>
      <span className="flex-1 text-sm leading-relaxed text-muted">
        {children}
      </span>
    </li>
  );
}

type PwaInstallDialogProps = {
  open: boolean;
  onClose: () => void;
} & PwaInstallState;

export function PwaInstallDialog({
  open,
  onClose,
  isInstalled,
  isInstalling,
  isIOS,
  isMacSafari,
  isInAppBrowser,
  canPrompt,
  install,
}: PwaInstallDialogProps) {
  const t = useT();
  const [showInstructions, setShowInstructions] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setShowInstructions(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) onClose();
  };

  const renderActions = () => {
    if (isInstalled) {
      return (
        <div className="flex items-center gap-2 border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
          <Check className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
          {t("install.installed")}
        </div>
      );
    }

    if (canPrompt) {
      return (
        <button
          type="button"
          disabled={isInstalling}
          onClick={() => void handleInstall()}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-transparent bg-linear-to-br from-accent via-[#9ccfff] to-accent-2 px-4 py-3 font-sans text-sm font-bold tracking-tight text-on-accent transition-[filter,opacity] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isInstalling ? (
            <LoaderCircle
              className="size-4 animate-spin"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : (
            <Download className="size-4" strokeWidth={1.75} aria-hidden />
          )}
          {isInstalling ? t("install.buttonLoading") : t("install.button")}
        </button>
      );
    }

    if (isInAppBrowser) {
      return (
        <p className="m-0 text-sm leading-relaxed text-muted">
          {t("install.unsupportedBrowser")}
        </p>
      );
    }

    if (!showInstructions) {
      return (
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-line bg-bg-1 px-4 py-3 font-sans text-sm text-ink transition-[background,border-color] hover:border-white/28 hover:bg-white/4"
        >
          {t("install.showInstructions")}
        </button>
      );
    }

    if (isMacSafari) {
      return (
        <ol className="m-0 grid list-none gap-3 p-0">
          <InstallStep number={1}>{t("install.macSafari.step1")}</InstallStep>
          <InstallStep number={2}>{t("install.macSafari.step2")}</InstallStep>
        </ol>
      );
    }

    if (isIOS) {
      return (
        <div className="grid gap-3">
          <ol className="m-0 grid list-none gap-3 p-0">
            <InstallStep number={1}>
              {t("install.ios.step1a")}
              <Share className="mx-1 inline size-4 align-text-bottom" />
              {t("install.ios.step1b")}
              <MoreHorizontal className="mx-1 inline size-4 align-text-bottom" />
              {t("install.ios.step1c")}
            </InstallStep>
            <InstallStep number={2}>{t("install.ios.step2")}</InstallStep>
          </ol>
          <p className="m-0 text-xs leading-relaxed text-muted">
            {t("install.ios.note")}
          </p>
          <IOSInstallImageSlider />
        </div>
      );
    }

    return (
      <p className="m-0 text-sm leading-relaxed text-muted">
        {t("install.fallback")}
      </p>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-bg-0/70 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="relative z-1 w-full max-w-md border border-line bg-bg-1 p-5 shadow-[0_24px_80px_rgb(0_0_0/0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id="pwa-install-title"
              className="m-0 font-display text-xl tracking-tight text-ink"
            >
              {t("install.title")}
            </h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">
              {t("install.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 cursor-pointer place-items-center border border-line text-muted transition-[background,border-color,color] hover:border-white/28 hover:bg-white/4 hover:text-ink"
            aria-label={t("install.close")}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="mt-5">{renderActions()}</div>
      </div>
    </div>,
    document.body,
  );
}
