"use client";

import Link from "next/link";
import { useState } from "react";
import PrivacyModal from "@/components/PrivacyModal";

export default function FooterCTASection() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-24 text-center fade-in">
      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
        你的脊椎，值得一个 24 小时的守卫
      </h2>

      {/* Subtitle */}
      <p className="text-text-secondary mt-4 text-lg">
        打开摄像头，让 AI 帮你记住——坐直
      </p>

      {/* CTA Button */}
      <Link
        href="/detect"
        className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-full text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98]"
      >
        开始检测 →
      </Link>

      {/* Footer Bar */}
      <div className="pt-20 border-t border-border mt-20">
        <div className="flex justify-between items-center text-sm text-text-muted">
          <span>体态哨兵 · TRAE AI 创造力大赛</span>
          <span>硬件交互赛道 · 社会公益 · 2026</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-text-muted flex items-center justify-center gap-3 flex-wrap">
        <span>Powered by TRAE Work · MediaPipe · DeepSeek</span>
        <span className="hidden sm:inline">·</span>
        <button onClick={() => setPrivacyOpen(true)} className="underline hover:text-text-secondary transition-colors">
          隐私说明
        </button>
      </div>

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </section>
  );
}