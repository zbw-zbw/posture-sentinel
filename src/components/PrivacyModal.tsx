"use client";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  const items = [
    { title: "视频数据", desc: "摄像头画面仅用于实时姿态分析，不录制、不截图、不上传到任何服务器。" },
    { title: "检测数据", desc: "坐姿评分、指标数据仅保存在你的浏览器本地存储（localStorage）中，不传输到外部。" },
    { title: "AI 建议", desc: "发送给 DeepSeek API 的仅是数值统计数据（评分、角度、百分比），不包含任何图像或个人信息。" },
    { title: "数据清除", desc: "你可以随时在设置中清除所有本地数据。" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-muted"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-6">🔒 隐私与数据安全</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-text-primary text-sm">{item.title}</p>
                <p className="text-text-secondary text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-6 pt-4 border-t border-border">
          体态哨兵尊重你的隐私。有任何疑问请联系开发者。
        </p>
      </div>
    </div>
  );
}
