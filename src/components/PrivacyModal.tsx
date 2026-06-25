"use client";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  const items = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      title: "视频数据",
      desc: "摄像头画面仅用于实时姿态分析，不录制、不截图、不上传到任何服务器。",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: "检测数据",
      desc: "坐姿评分、指标数据仅保存在你的浏览器本地存储（localStorage）中，不传输到外部。",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
          <path d="M9 20h6" />
          <path d="M10 22h4" />
        </svg>
      ),
      title: "AI 建议",
      desc: "发送给 DeepSeek API 的仅是数值统计数据（评分、角度、百分比），不包含任何图像或个人信息。",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      title: "数据清除",
      desc: "你可以随时在设置中清除所有本地数据。",
    },
  ];

  return (
    <div className="fixed top-16 right-0 z-[100] p-4 md:p-6 animate-slide-in-right">
      <div className="relative bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-alt hover:bg-border text-text-muted hover:text-text-primary transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2 className="text-xl font-bold text-text-primary">隐私与数据安全</h2>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            我们高度重视你的隐私，以下是数据处理的详细说明
          </p>
        </div>

        {/* Privacy Items - Card Layout */}
        <div className="px-6 pb-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-4 bg-surface-alt rounded-xl border border-border"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-lg">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm">{item.title}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors"
          >
            我已了解
          </button>
          <p className="text-xs text-text-muted mt-3 text-center">
            体态哨兵尊重你的隐私。有任何疑问请联系开发者。
          </p>
        </div>
      </div>
    </div>
  );
}
