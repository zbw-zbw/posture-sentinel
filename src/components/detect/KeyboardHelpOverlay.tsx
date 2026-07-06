"use client";

interface KeyboardHelpOverlayProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "Space", desc: "暂停 / 继续检测" },
  { key: "Esc", desc: "结束检测（按两次确认）" },
  { key: "P", desc: "开启 / 暂停 番茄钟" },
  { key: "F", desc: "全屏 / 退出全屏" },
  { key: "?", desc: "显示/隐藏快捷键帮助" },
];

export default function KeyboardHelpOverlay({ open, onClose }: KeyboardHelpOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
          </svg>
          <h3 className="text-lg font-bold text-text-primary">键盘快捷键</h3>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-alt transition-colors">
              <span className="text-sm text-text-secondary">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg border border-border bg-surface-alt text-text-primary font-mono text-sm font-semibold">{s.key}</kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-5 bg-primary-dark hover:bg-primary text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          知道了
        </button>
      </div>
    </div>
  );
}
