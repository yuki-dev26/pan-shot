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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0e14",
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
