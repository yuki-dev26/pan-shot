import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import {
  defaultLocale,
  localeFromSegment,
  localeToPath,
  locales,
  messages,
} from "@panshot/shared";
import { getSiteUrl } from "../../lib/site";
import { hreflangAlternates, openGraphLocales } from "../../lib/i18n-seo";
import { LocaleProvider } from "../../components/locale-provider";
import "../globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type LocaleParams = { locale?: string[] };

export function generateStaticParams(): LocaleParams[] {
  return locales.map((locale) => {
    const path = localeToPath(locale);
    return { locale: path === "/" ? [] : [path.slice(1)] };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale: segments } = await params;
  const locale = localeFromSegment(segments?.[0]);
  const metadataBase = new URL(getSiteUrl());

  // Unknown path: the page renders the 404 below, so keep it out of the index.
  if (!locale) {
    return { metadataBase, title: "PanShot", robots: { index: false } };
  }

  const meta = messages[locale].meta;
  const path = localeToPath(locale);

  return {
    metadataBase,
    title: meta.title,
    description: meta.description,
    applicationName: "PanShot",
    keywords: meta.keywords.split(","),
    authors: [{ name: "PanShot" }],
    creator: "PanShot",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: path,
      languages: hreflangAlternates(),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocales[locale],
      url: path,
      siteName: "PanShot",
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "PanShot" }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: ["/og.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "PanShot",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon-48.png", type: "image/png", sizes: "48x48" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0e14" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
  ],
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<LocaleParams>;
}>) {
  const { locale: segments } = await params;
  const locale = localeFromSegment(segments?.[0]) ?? defaultLocale;

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${outfit.variable} h-full`}
    >
      <body className="min-h-full overflow-x-clip antialiased">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
