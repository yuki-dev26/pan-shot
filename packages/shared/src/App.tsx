"use client";

import titleAsset from "../assets/title.png";
import { InstallButton } from "./components/InstallButton";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SiteInfo } from "./components/SiteInfo";
import { VideoStudio } from "./components/VideoStudio";
import { useT } from "./i18n/context";

function assetSrc(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}

export function App() {
  const t = useT();

  return (
    <main className="relative z-1 flex min-h-dvh flex-col gap-4 p-[max(1rem,env(safe-area-inset-left))] pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-6 sm:p-[clamp(1.25rem,3vw,2.5rem)] sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="animate-rise">
        <div className="flex items-start justify-between gap-3">
          <h1 className="m-0 max-w-full leading-none">
            <img
              src={assetSrc(titleAsset)}
              alt={t("app.titleAlt")}
              className="block h-auto w-[min(100%,11rem)] max-w-full select-none sm:w-[min(100%,13.5rem)] md:w-[min(100%,16rem)]"
              draggable={false}
            />
          </h1>
          <div className="mt-2 flex shrink-0 items-center gap-2 sm:mt-3.5 sm:gap-2.5">
            <InstallButton />
            <LanguageSwitcher />
          </div>
        </div>
        <p className="mt-2 mb-0 max-w-3xl font-display text-[clamp(1rem,4.5vw,1.45rem)] leading-snug tracking-tight text-ink text-pretty sm:mt-2.5">
          {t("app.tagline")
            .split("\n")
            .map((line, i, lines) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 ? <br className="sm:hidden" /> : null}
              </span>
            ))}
        </p>
      </header>

      <VideoStudio />
      <SiteInfo />
    </main>
  );
}
