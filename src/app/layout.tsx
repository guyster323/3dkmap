import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "천하동시 — 전략 삼국지 동무",
  description:
    "요코야마 미츠테루 전략 삼국지를 펼친 그 시각, 중원·강동·한반도에서 동시에 일어나던 일을 전쟁상황실처럼 본다.",
  applicationName: "천하동시",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#060a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
