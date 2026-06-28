"use client";

export default function TechPrivacySection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1100px] px-4 md:px-6 py-24 fade-in"
    >
      {/* Title */}
      <h2 className="text-center text-3xl font-bold text-text-primary md:text-4xl">
        技术实现 · 你的隐私最重要
      </h2>
      <p className="mx-auto mt-3 text-center text-text-secondary">
        了解体态哨兵背后的技术原理与隐私保护机制
      </p>

      {/* Grid */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Card: Tech Stack */}
        <div className="rounded-2xl bg-surface p-8 card-hover">
          <h3 className="mb-6 text-xl font-semibold">技术栈</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>硬件接入：浏览器 MediaDevices API</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
                <path d="M9 20h6" />
                <path d="M10 22h4" />
              </svg>
              <span>AI 检测：MediaPipe Pose Landmarker（33个关键点）</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>前端框架：Next.js + React + TypeScript</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>可视化：Canvas 2D（骨骼关键点绘制）</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              <span>数据存储：浏览器 localStorage</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
                <path d="M9 20h6" />
                <path d="M10 22h4" />
              </svg>
              <span>AI 建议：DeepSeek API（文字建议）</span>
            </li>
          </ul>
          <div className="mt-6 pt-4 text-sm text-text-muted">
            前端基于 Next.js + React + TypeScript 构建
          </div>
        </div>

        {/* Right Card: Privacy Promise */}
        <div className="rounded-2xl border-l-4 border-primary bg-surface p-8 card-hover">
          <h3 className="mb-6 text-xl font-semibold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            隐私安全承诺
          </h3>
          <ul className="flex flex-col gap-1">
            <li className="py-2 text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              所有检测在本地浏览器完成
            </li>
            <li className="py-2 text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              视频数据不上传、不存储、不外传
            </li>
            <li className="py-2 text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              健康数据仅保存在你的设备上
            </li>
          </ul>
          <div className="mt-6 pt-4 text-xs text-text-muted">
            体态哨兵不需要任何服务器，你的摄像头画面永远不会离开你的电脑。
          </div>
        </div>
      </div>
    </section>
  );
}