"use client";

interface DetectControlsProps {
  state: "idle" | "detecting" | "paused";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function DetectControls({ state, onStart, onPause, onResume, onStop }: DetectControlsProps) {
  if (state === "idle") {
    return (
      <button
        onClick={onStart}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg hover:shadow-primary/25 mx-auto"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        开始检测
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
      {state === "detecting" ? (
        <button
          onClick={onPause}
          className="flex items-center gap-2 bg-warning hover:bg-warning/90 text-white font-semibold px-6 py-3 rounded-full transition-all w-full sm:w-auto justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          暂停
        </button>
      ) : (
        <button
          onClick={onResume}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition-all w-full sm:w-auto justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          继续
        </button>
      )}
      <button
        onClick={onStop}
        className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-semibold px-6 py-3 rounded-full border border-border transition-all w-full sm:w-auto justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
        结束
      </button>
    </div>
  );
}
