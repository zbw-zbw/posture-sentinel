"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/detect", label: "实时检测" },
  { href: "/report", label: "健康日报" },
  { href: "/settings", label: "设置" },
  { href: "/achievements", label: "成就徽章" },
  { href: "/data", label: "数据管理" },
];

export default function FooterCTASection() {
  return (
    <footer className="border-t border-border bg-surface-alt/50">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-20 text-center fade-in">
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
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98]"
          >
            开始检测
            <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block ml-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="border-t border-border">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Brand + Copyright */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 100 100" className="w-5 h-5">
                <rect width="100" height="100" rx="24" fill="#10b981"/>
                <line x1="50" y1="18" x2="50" y2="84" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <line x1="38" y1="42" x2="62" y2="42" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <line x1="38" y1="62" x2="62" y2="62" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-semibold text-text-primary">体态哨兵</span>
            </div>
            <p className="text-xs text-text-muted">
              本地 AI 坐姿守护 · Powered by MediaPipe
            </p>
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} 体态哨兵 · 所有数据存储在本地，不会上传
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
