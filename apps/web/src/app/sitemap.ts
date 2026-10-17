import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@panshot/shared";
import { absoluteLocaleUrl, hreflangAlternates } from "../lib/i18n-seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const languages = hreflangAlternates();

  return locales.map((locale) => ({
    url: absoluteLocaleUrl(locale),
    lastModified,
    changeFrequency: "weekly",
    priority: locale === defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
