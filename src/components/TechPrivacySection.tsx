"use client";

export default function TechPrivacySection() {
  return (
    <section
      id="tech-privacy"
      className="mx-auto max-w-[1100px] px-6 py-24 fade-in"
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
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h3 className="mb-6 text-xl font-semibold">技术栈</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>📷</span>
              <span>硬件接入：浏览器 MediaDevices API</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>🤖</span>
              <span>AI 检测：MediaPipe Pose Landmarker（33个关键点）</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>⚛️</span>
              <span>前端框架：Next.js + React + TypeScript</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>🎨</span>
              <span>可视化：Canvas 2D（骨骼关键点绘制）</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>💾</span>
              <span>数据存储：浏览器 localStorage</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-surface-alt p-3 text-sm text-text-primary">
              <span>🧠</span>
              <span>AI 建议：DeepSeek API（文字建议）</span>
            </li>
          </ul>
          <div className="mt-6 border-t border-border pt-4 text-sm text-text-muted">
            全程使用 TRAE IDE + TRAE Work 开发
          </div>
        </div>

        {/* Right Card: Privacy Promise */}
        <div className="rounded-2xl border-l-4 border-primary bg-surface p-8">
          <h3 className="mb-6 text-xl font-semibold">🔒 隐私安全承诺</h3>
          <ul className="flex flex-col gap-1">
            <li className="py-2 text-sm">✅ 所有检测在本地浏览器完成</li>
            <li className="py-2 text-sm">✅ 视频数据不上传、不存储、不外传</li>
            <li className="py-2 text-sm">✅ 健康数据仅保存在你的设备上</li>
          </ul>
          <div className="mt-6 border-t border-border pt-4 text-xs text-text-muted">
            体态哨兵不需要任何服务器，你的摄像头画面永远不会离开你的电脑。
          </div>
        </div>
      </div>
    </section>
  );
}