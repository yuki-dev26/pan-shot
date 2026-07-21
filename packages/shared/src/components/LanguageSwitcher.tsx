"use client";

import { ChevronDown, Globe } from "lucide-react";
import { locales, localeLabels, type Locale } from "../i18n/config";
import { useI18n } from "../i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="relative inline-flex h-9 items-center">
      <span className="sr-only">{t("lang.label")}</span>
      <Globe
        className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted"
        aria-hidden
        strokeWidth={1.75}
      />
      <select
        className="h-full cursor-pointer appearance-none border border-line bg-bg-1/80 py-0 pr-8 pl-8 font-sans text-sm leading-none text-ink outline-none backdrop-blur-md transition-[border-color,background] duration-200 hover:border-white/28 focus:border-accent/55"
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
  );
}
