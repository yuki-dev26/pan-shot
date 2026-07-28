"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { I18nProvider, localeToPath, type Locale } from "@panshot/shared";

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const onLocaleChange = useCallback(
    (next: Locale) => {
      router.push(localeToPath(next));
    },
    [router],
  );

  return (
    <I18nProvider locale={locale} onLocaleChange={onLocaleChange}>
      {children}
    </I18nProvider>
  );
}
