import { notFound } from "next/navigation";
import { App, localeFromSegment, messages } from "@panshot/shared";
import {
  absoluteLocaleUrl,
  featureLists,
  hreflangCodes,
} from "../../lib/i18n-seo";

type LocaleParams = { locale?: string[] };

export default async function Home({
  params,
}: {
  params: Promise<LocaleParams>;
}) {
  const { locale: segments } = await params;
  const locale = localeFromSegment(segments?.[0]);
  if (!locale) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PanShot",
    url: absoluteLocaleUrl(locale),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description: messages[locale].meta.description,
    inLanguage: hreflangCodes[locale],
    featureList: featureLists[locale],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <App />
    </>
  );
}
