import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollObserver from "@/components/ScrollObserver";
import StorageCleanup from "@/components/StorageCleanup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "体态哨兵 - AI实时坐姿检测，守护你的脊椎健康",
  description:
    "基于Web摄像头的AI实时坐姿检测工具。零成本、零穿戴、零门槛，打开网页即用。检测驼背、头前倾等不良坐姿，实时提醒纠正，生成每日脊椎健康报告。",
  keywords: ["坐姿检测", "AI", "脊椎健康", "驼背矫正", "姿态检测", "体态哨兵"],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "体态哨兵",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "体态哨兵 - AI实时坐姿检测",
    description: "打开摄像头，AI守护你的每一寸脊椎",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${inter.variable} ${notoSansSC.variable} font-sans min-h-full antialiased`}
      >
        <ScrollObserver />
        <StorageCleanup />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
