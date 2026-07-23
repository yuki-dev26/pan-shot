"use client";

import { ExternalLink } from "lucide-react";
import { useT } from "../i18n/context";

const INSTALL_GUIDE = {
  url: "https://note.com/yuki_tech/n/n5bbf2686fa98",
  title: "PWAインストール方法をOSやブラウザごとに解説",
  description:
    "iOS・Android・各ブラウザごとのホーム画面追加手順をまとめています。",
  image:
    "https://assets.st-note.com/production/uploads/images/274883838/rectangle_large_type_2_9dacdbb94151c951f13f0cd6fb0ee3a1.png?width=1200",
  siteName: "note.com",
} as const;

export function InstallGuideLink() {
  const t = useT();

  return (
    <a
      href={INSTALL_GUIDE.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden border border-line bg-bg-0/50 transition-[border-color,background] hover:border-white/28 hover:bg-white/4"
      aria-label={t("install.guide.open")}
    >
      <div className="aspect-[1200/630] overflow-hidden bg-bg-0">
        <img
          src={INSTALL_GUIDE.image}
          alt=""
          width={1200}
          height={630}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="grid gap-1.5 p-3.5">
        <p className="m-0 text-[11px] tracking-wide text-muted uppercase">
          {INSTALL_GUIDE.siteName}
        </p>
        <p className="m-0 font-display text-sm leading-snug tracking-tight text-ink">
          {INSTALL_GUIDE.title}
        </p>
        <p className="m-0 line-clamp-2 text-xs leading-relaxed text-muted">
          {INSTALL_GUIDE.description}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-accent transition-opacity group-hover:opacity-90">
          {t("install.guide.open")}
          <ExternalLink className="size-3" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </a>
  );
}
