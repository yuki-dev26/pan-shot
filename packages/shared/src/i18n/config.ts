import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";

export const locales = ["ja", "en", "ko", "zh-CN", "zh-TW"] as const;

export type Locale = (typeof locales)[number];

export type Messages = typeof ja;

export const defaultLocale: Locale = "ja";

export const messages: Record<Locale, Messages> = {
  ja,
  en,
  ko,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

export const localeLabels: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * URL segment for each locale. The default locale is served from the site root
 * so that the already-indexed `/` keeps its canonical position.
 */
export const localeSegments: Record<Locale, string> = {
  ja: "",
  en: "en",
  ko: "ko",
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
};

export function localeToPath(locale: Locale): string {
  const segment = localeSegments[locale];
  return segment ? `/${segment}` : "/";
}

export function localeFromSegment(segment: string | undefined): Locale | null {
  if (segment == null) return defaultLocale;
  const normalized = segment.toLowerCase();
  return (
    locales.find((locale) => localeSegments[locale] === normalized) ?? null
  );
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const candidates = [
    navigator.language,
    ...(navigator.languages ?? []),
  ];

  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    if (tag.startsWith("ja")) return "ja";
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("ko")) return "ko";
    if (tag === "zh-cn" || tag === "zh-hans" || tag.startsWith("zh-hans")) {
      return "zh-CN";
    }
    if (
      tag === "zh-tw" ||
      tag === "zh-hk" ||
      tag === "zh-mo" ||
      tag === "zh-hant" ||
      tag.startsWith("zh-hant")
    ) {
      return "zh-TW";
    }
    if (tag.startsWith("zh")) return "zh-CN";
  }

  return defaultLocale;
}

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type MessageKey = NestedKeyOf<Messages>;

export function getMessage(
  dict: Messages,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur !== "string") return key;

  if (!vars) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`,
  );
}
