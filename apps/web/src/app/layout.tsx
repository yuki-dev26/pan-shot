import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider, defaultLocale, messages } from "@panshot/shared";
import { getSiteUrl } from "../lib/site";
import "./globals.css";

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

const defaultMessages = messages[defaultLocale];
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultMessages.meta.title,
  description: defaultMessages.meta.description,
  applicationName: "PanShot",
  keywords: defaultMessages.meta.keywords.split(","),
  authors: [{ name: "PanShot" }],
  creator: "PanShot",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "PanShot",
    title: defaultMessages.meta.ogTitle,
    description: defaultMessages.meta.ogDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PanShot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultMessages.meta.ogTitle,
    description: defaultMessages.meta.ogDescription,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PanShot",
  url: siteUrl,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  description: defaultMessages.meta.description,
  inLanguage: "ja",
  featureList: [
    "画像の見どころ（ズーム点）指定",
    "寄り・カット・引きで画像が映えるカメラワーク演出",
    "ブラウザ上での動画書き出し・ダウンロード",
    "登録不要・完全無料",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={`${syne.variable} ${outfit.variable} h-full`}
    >
      <body className="min-h-full overflow-x-clip antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
