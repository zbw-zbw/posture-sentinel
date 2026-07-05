"use client";

import { memo } from "react";

interface PomodoroTimerProps {
  phase: "idle" | "focusing" | "break" | "paused";
  remaining: number;
  completedFocus: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onStop: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function PomodoroTimerImpl({
  phase,
  remaining,
  completedFocus,
  isRunning,
  onStart,
  onPause,
  onResume,
  onSkip,
  onStop,
}: PomodoroTimerProps) {
  const isFocus = phase === "focusing" || (phase === "paused" && remaining > 300);
  const isBreak = phase === "break";
  const isActive = isRunning || phase === "paused";

  // Don't render anything in idle state — the start button is in DetectControls
  if (phase === "idle") {
    return (
      <button
        onClick={onStart}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors group"
        title="开启 25 分钟专注 + 5 分钟休息循环"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2" />
          <path d="M5 3 2 6" />
          <path d="m22 6-3-3" />
        </svg>
        <span>专注模式（番茄钟）</span>
      </button>
    );
  }

  const ringColor = isBreak ? "var(--color-info)" : isFocus ? "var(--color-primary)" : "var(--color-text-muted)";
  const bgTint = isBreak ? "bg-info-light" : "bg-primary-light";
  const label = isBreak ? "休息中" : isFocus ? "专注中" : "已暂停";
  const labelColor = isBreak ? "text-info-text" : isFocus ? "text-primary-text" : "text-text-muted";

  return (
    <div className={`flex items-center gap-3 ${bgTint} rounded-xl px-4 py-2.5`}>
      {/* Phase indicator dot */}
      <span
        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: ringColor,
          animation: isRunning ? "pulse-green 1.5s infinite" : "none",
        }}
      />

      {/* Label */}
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
        <span className="text-lg font-bold tabular-nums text-text-primary">
          {formatTime(remaining)}
        </span>
      </div>

      {/* Completed focus count */}
      {completedFocus > 0 && (
        <span className="text-xs text-text-muted ml-1">
          已完成 {completedFocus} 轮
        </span>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 ml-auto">
        {isRunning ? (
          <button
            onClick={onPause}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-text-secondary transition-colors"
            title="暂停番茄钟"
            aria-label="暂停番茄钟"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        ) : phase === "paused" ? (
          <button
            onClick={onResume}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-text-secondary transition-colors"
            title="继续番茄钟"
            aria-label="继续番茄钟"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : null}

        <button
          onClick={onSkip}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-text-muted transition-colors"
          title="跳过当前阶段"
          aria-label="跳过当前阶段"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>

        <button
          onClick={onStop}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-text-muted transition-colors"
          title="结束番茄钟"
          aria-label="结束番茄钟"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const PomodoroTimer = memo(PomodoroTimerImpl);
export default PomodoroTimer;
