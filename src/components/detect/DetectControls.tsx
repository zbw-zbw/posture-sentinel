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
        <span>📷</span> 开始检测
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
          <span>⏸️</span> 暂停
        </button>
      ) : (
        <button
          onClick={onResume}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition-all w-full sm:w-auto justify-center"
        >
          <span>▶️</span> 继续
        </button>
      )}
      <button
        onClick={onStop}
        className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-semibold px-6 py-3 rounded-full border border-border transition-all w-full sm:w-auto justify-center"
      >
        <span>⏹️</span> 结束
      </button>
    </div>
  );
}
