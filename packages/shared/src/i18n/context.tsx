"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultLocale,
  detectLocale,
  getMessage,
  messages,
  type Locale,
  type MessageKey,
  type Messages,
} from "./config";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
};

export function I18nProvider({
  children,
  locale: fixedLocale,
  onLocaleChange,
}: I18nProviderProps) {
  const [detectedLocale, setDetectedLocale] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);
  const isFixed = fixedLocale != null;
  const locale = isFixed ? fixedLocale : detectedLocale;

  useEffect(() => {
    if (isFixed) return;
    try {
      localStorage.removeItem("panshot-locale");
    } catch {
      // ignore
    }
    setDetectedLocale(detectLocale());
    setReady(true);
  }, [isFixed]);

  useEffect(() => {
    if (isFixed || !ready) return;
    document.documentElement.lang = locale;
    document.title = getMessage(messages[locale], "meta.title");
  }, [isFixed, locale, ready]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (onLocaleChange) {
        onLocaleChange(next);
        return;
      }
      setDetectedLocale(next);
    },
    [onLocaleChange],
  );

  const value = useMemo<I18nContextValue>(() => {
    const dict = messages[locale];
    return {
      locale,
      setLocale,
      messages: dict,
      t: (key, vars) => getMessage(dict, key, vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
