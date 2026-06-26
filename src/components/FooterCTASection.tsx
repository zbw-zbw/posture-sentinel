"use client";

import Link from "next/link";

export default function FooterCTASection() {
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
      <div className="mt-10">
        <Link
          href="/detect"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-full text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98]"
        >
          开始检测
          <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block ml-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Footer Bar */}
      <div className="pt-20 mt-20">
        <div className="flex justify-center items-center text-sm text-text-muted">
          <span>体态哨兵 · 本地 AI 坐姿守护</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-text-muted">
        <span>Powered by MediaPipe · DeepSeek</span>
      </div>
    </section>
  );
}