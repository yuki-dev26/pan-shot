import type { Metadata } from "next";
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
  title: "QuickScene — 一枚絵をカットイン動画に",
  description:
    "一枚絵の見どころを指定するだけで、自然なカットイン動画になるツール。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${syne.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
