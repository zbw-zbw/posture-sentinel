"use client";

interface AlertPreviewProps {
  onPreview: () => void;
}

export default function AlertPreview({ onPreview }: AlertPreviewProps) {
  return (
    <button
      onClick={onPreview}
      className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl border border-border transition-all text-sm"
    >
      <span>🔊</span> 预览提醒效果
    </button>
  );
}
