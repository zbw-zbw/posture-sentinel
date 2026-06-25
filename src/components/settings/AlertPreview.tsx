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
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
      预览提醒效果
    </button>
  );
}
