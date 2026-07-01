import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-light flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-3">404</h1>
        <p className="text-text-secondary mb-6">页面未找到，可能链接已失效或页面已移动。</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/25">
            返回首页
          </Link>
          <Link href="/detect" className="bg-surface-alt hover:bg-border text-text-primary font-medium px-6 py-2.5 rounded-xl transition-colors">
            开始检测
          </Link>
        </div>
      </div>
    </div>
  );
}
