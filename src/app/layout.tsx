import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tech Blog Study - 英語×技術学習",
    template: "%s | Tech Blog Study",
  },
  description:
    "英語の技術記事でプログラミング知識と英語力を同時に向上。Dev.toの記事をAI翻訳・語彙解説・音声読み上げで効率的に学習できるプラットフォーム。",
  keywords: [
    "英語学習",
    "技術記事",
    "プログラミング",
    "Dev.to",
    "AI翻訳",
    "語彙学習",
    "English",
    "Programming",
  ],
  authors: [{ name: "Tech Blog Study" }],
  creator: "Tech Blog Study",
  publisher: "Tech Blog Study",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tech-blog-de-study.vercel.app"),
  openGraph: {
    title: "Tech Blog Study - 英語×技術学習",
    description: "英語の技術記事でプログラミング知識と英語力を同時に向上",
    url: "https://tech-blog-de-study.vercel.app",
    siteName: "Tech Blog Study",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Blog Study - 英語×技術学習",
    description: "英語の技術記事でプログラミング知識と英語力を同時に向上",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tech Blog Study" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
