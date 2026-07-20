import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
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

export const metadata: Metadata = {
  title: "QuickScene - イラストをおしゃれなカットイン映像に",
  description:
    "イラストにカットイン演出を加えて、おしゃれな動画に変換するツール",
  applicationName: "QuickScene",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QuickScene",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${syne.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full overflow-x-clip antialiased">{children}</body>
    </html>
  );
}
