"use client";

import StretchGuide from "./StretchGuide";

interface RestReminderBannerProps {
  phase: "idle" | "counting" | "triggered" | "resting" | "snoozed";
  elapsedSinceLastRest: number;
  restRemaining: number;
  progress: number;
  intervalMinutes: number;
  showStretchGuide: boolean;
  onStartRest: () => void;
  onSnooze: () => void;
  onSkip: () => void;
  onSkipRest: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RestReminderBanner({
  phase,
  elapsedSinceLastRest,
  restRemaining,
  progress,
  intervalMinutes,
  showStretchGuide,
  onStartRest,
  onSnooze,
  onSkip,
  onSkipRest,
}: RestReminderBannerProps) {
  // Idle: nothing to show
  if (phase === "idle") return null;

  // === Resting mode: full-screen overlay with countdown ===
  if (phase === "resting") {
    const totalSec = intervalMinutes * 60; // approx, use restDurationMinutes instead
    const restMinutes = Math.ceil(restRemaining / 60);
    const ringProgress = totalSec > 0 ? 1 - restRemaining / (restMinutes * 60) : 0;
    const circumference = 2 * Math.PI * 52;
    const dashOffset = circumference * (1 - ringProgress);

    return (
      <div className="fixed inset-0 z-[85] flex items-center justify-center bg-dark/50 backdrop-blur-sm p-4">
        <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          {/* Circular countdown ring */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-linear"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary tabular-nums">
                {formatTime(restRemaining)}
              </span>
              <span className="text-xs text-text-muted mt-0.5">休息中</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-text-primary mb-1">
            好好放松一下吧
          </h3>
          <p className="text-sm text-text-secondary mb-5">
            站起来走动走动，做几个拉伸动作
          </p>

          {/* Stretch guide */}
          {showStretchGuide && (
            <div className="mb-5">
              <StretchGuide
                onComplete={onSkipRest}
                onSkip={() => {}}
              />
            </div>
          )}

          {/* Skip rest button */}
          <button
            onClick={onSkipRest}
            className="w-full bg-surface-alt hover:bg-border text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            结束休息
          </button>
        </div>
      </div>
    );
  }

  // === Triggered mode: inline banner at top of detect area ===
  // This shows when the rest timer just hit zero but user hasn't acted yet
  // We detect this: phase === "counting" but elapsedSinceLastRest is 0 and progress is 1
  // Actually we need a separate "triggered" state. Let's use: phase === "snoozed" shows snoozed banner,
  // and we add a triggered pseudo-state via the parent.

  // For now, the "triggered" banner shows when phase transitions to resting with full remaining time
  // But since resting is handled above, let's use a different approach:
  // The parent will pass a special phase. Let's check if we need to show the "trigger" prompt.
  // Actually, looking at the hook, when threshold is reached it goes straight to "resting".
  // So we need the parent to intercept and show a "trigger" prompt first.
  // For simplicity, let's add the trigger as a mode when phase is "counting" but we just hit the threshold.
  // The parent component can manage this. For now, return the progress bar for "counting" mode.

  // === Counting mode: thin progress bar at bottom ===
  if (phase === "counting") {
    const remaining = intervalMinutes * 60 - elapsedSinceLastRest;
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-surface-alt/50 rounded-xl">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">
              下次休息还有 {formatTime(Math.max(0, remaining))}
            </span>
            <span className="text-xs text-text-muted">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // === Snoozed mode: small indicator ===
  if (phase === "snoozed") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-warning-light/50 rounded-xl">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-warning flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-xs text-warning font-medium">休息提醒已延后 5 分钟</span>
      </div>
    );
  }

  return null;
}

/** Standalone trigger prompt component - shows when rest time arrives, before user acts */
export function RestTriggerPrompt({
  elapsedMinutes,
  onStart,
  onSnooze,
  onSkip,
}: {
  elapsedMinutes: number;
  onStart: () => void;
  onSnooze: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-dark/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-text-primary mb-2">
          休息时间到了！
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          已连续检测 {elapsedMinutes} 分钟，建议起身活动一下
        </p>

        <div className="space-y-2">
          <button
            onClick={onStart}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors"
          >
            立即休息
          </button>
          <div className="flex gap-2">
            <button
              onClick={onSnooze}
              className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              延后 5 分钟
            </button>
            <button
              onClick={onSkip}
              className="flex-1 bg-transparent text-text-muted hover:text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              忽略本次
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
