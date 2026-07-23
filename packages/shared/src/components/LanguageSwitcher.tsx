"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Globe, X } from "lucide-react";
import { locales, localeLabels, type Locale } from "../i18n/config";
import { useI18n } from "../i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: icon opens centered menu */}
      <button
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-line bg-bg-1/80 text-ink backdrop-blur-md transition-[background,border-color] hover:border-white/28 sm:hidden"
        aria-label={t("lang.label")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Globe className="size-4" strokeWidth={1.75} aria-hidden />
      </button>

      {/* Desktop: native select */}
      <label className="relative hidden h-9 items-center sm:inline-flex">
        <span className="sr-only">{t("lang.label")}</span>
        <Globe
          className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-ink"
          aria-hidden
          strokeWidth={1.75}
        />
        <select
          className="h-full cursor-pointer appearance-none border border-line bg-bg-1/80 py-0 pr-8 pl-8 font-sans text-sm leading-none text-ink outline-none backdrop-blur-md transition-[border-color,background] hover:border-white/28 focus:border-accent/55"
          value={locale}
          aria-label={t("lang.label")}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {localeLabels[code]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden
          strokeWidth={1.75}
        />
      </label>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:hidden"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute inset-0 bg-bg-0/70 backdrop-blur-sm"
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lang-picker-title"
              className="relative z-1 w-full max-w-xs border border-line bg-bg-1 p-4 shadow-[0_24px_80px_rgb(0_0_0/0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2
                  id="lang-picker-title"
                  className="m-0 font-display text-base tracking-tight text-ink"
                >
                  {t("lang.label")}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center border border-line text-muted transition-[background,border-color,color] hover:border-white/28 hover:bg-white/4 hover:text-ink"
                  aria-label={t("install.close")}
                >
                  <X className="size-4" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
              <ul className="m-0 grid list-none gap-1.5 p-0">
                {locales.map((code) => {
                  const selected = code === locale;
                  return (
                    <li key={code}>
                      <button
                        type="button"
                        onClick={() => pick(code)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 border px-3.5 py-3 text-left font-sans text-sm transition-colors ${
                          selected
                            ? "border-accent/55 bg-accent/10 text-ink"
                            : "border-line bg-transparent text-muted hover:border-white/28 hover:text-ink"
                        }`}
                      >
                        {localeLabels[code]}
                        {selected ? (
                          <Check
                            className="size-4 shrink-0 text-accent"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
