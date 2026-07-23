"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PwaInstallDialog } from "./PwaInstallDialog";
import { useT } from "../i18n/context";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { isDesktopApp } from "../lib/platform";

export function InstallButton() {
  const t = useT();
  const pwa = usePwaInstall();
  const [open, setOpen] = useState(false);

  if (isDesktopApp() || pwa.isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-line bg-bg-1/80 text-ink backdrop-blur-md transition-[background,border-color] hover:border-white/28 sm:hidden"
        aria-label={t("install.label")}
      >
        <Download className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
      <PwaInstallDialog open={open} onClose={() => setOpen(false)} {...pwa} />
    </>
  );
}
