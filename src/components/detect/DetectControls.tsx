"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface DetectControlsProps {
  state: "idle" | "detecting" | "paused";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isLoading?: boolean;
  onToggleFullscreen?: () => void;
  onToggleHelp?: () => void;
  onTogglePomodoro?: () => void;
  /** When true, keyboard shortcuts are disabled (modal/overlay is open) */
  shortcutsDisabled?: boolean;
}

export default function DetectControls({
  state,
  onStart,
  onPause,
  onResume,
  onStop,
  isLoading = false,
  onToggleFullscreen,
  onToggleHelp,
  onTogglePomodoro,
  shortcutsDisabled = false,
}: DetectControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Esc double-press confirmation: first Esc shows a toast, second Esc within
  // 3s actually stops the session.
  const lastEscRef = useRef(0);
  const escConfirmTimerRef = useRef<number | null>(null);
  const [showEscConfirm, setShowEscConfirm] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Disable all shortcuts when a modal/overlay is open
      if (shortcutsDisabled) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (state === "idle") {
          if (!isLoading) onStart();
        } else if (state === "detecting") {
          onPause();
        } else if (state === "paused") {
          onResume();
        }
      } else if (e.code === "Escape") {
        // Only handle Esc as "stop" when NOT in fullscreen (browser uses Esc
        // to exit fullscreen) and not in idle (nothing to stop).
        if (state === "idle" || document.fullscreenElement) return;
        e.preventDefault();
        const now = performance.now();
        if (now - lastEscRef.current < 3000) {
          // Second press within 3s → confirm stop
          lastEscRef.current = 0;
          setShowEscConfirm(false);
          if (escConfirmTimerRef.current) {
            window.clearTimeout(escConfirmTimerRef.current);
            escConfirmTimerRef.current = null;
          }
          onStop();
        } else {
          // First press → show confirmation toast, arm the 3s window
          lastEscRef.current = now;
          setShowEscConfirm(true);
          if (escConfirmTimerRef.current) {
            window.clearTimeout(escConfirmTimerRef.current);
          }
          escConfirmTimerRef.current = window.setTimeout(() => {
            setShowEscConfirm(false);
            escConfirmTimerRef.current = null;
          }, 3000);
        }
      } else if (e.code === "KeyF") {
        if (state === "idle") return;
        e.preventDefault();
        onToggleFullscreen?.();
      } else if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        if (state === "idle") return;
        e.preventDefault();
        onToggleHelp?.();
      } else if (e.code === "KeyP") {
        e.preventDefault();
        onTogglePomodoro?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (escConfirmTimerRef.current) {
        window.clearTimeout(escConfirmTimerRef.current);
        escConfirmTimerRef.current = null;
      }
    };
  }, [state, isLoading, onStart, onPause, onResume, onStop, onToggleFullscreen, onToggleHelp, onTogglePomodoro, shortcutsDisabled]);

  const handleFullscreen = useCallback(() => {
    if (!onToggleFullscreen) {
      // Default behavior: toggle document fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    } else {
      onToggleFullscreen();
    }
  }, [onToggleFullscreen]);

  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary-dark hover:bg-primary text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              正在启动...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              开始检测
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        {state === "detecting" ? (
          <button
            onClick={onPause}
            title="暂停 (Space)"
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
            title="继续 (Space)"
            className="flex items-center gap-2 bg-primary-dark hover:bg-primary text-white font-semibold px-6 py-3 rounded-full transition-all w-full sm:w-auto justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            继续
          </button>
        )}
        <button
          onClick={onStop}
          title="结束检测 (Esc)"
          className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger-text font-semibold px-6 py-3 rounded-full border border-danger/20 transition-all w-full sm:w-auto justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
          结束
        </button>
        {/* Fullscreen toggle */}
        <button
          onClick={handleFullscreen}
          title={isFullscreen ? "退出全屏 (F)" : "全屏 (F)"}
          className="flex items-center justify-center w-11 h-11 bg-surface-alt hover:bg-border text-text-secondary rounded-full transition-all flex-shrink-0"
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>
      {/* Keyboard shortcut hints */}
      <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt text-text-secondary font-mono text-xs">Space</kbd>
          暂停/继续
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt text-text-secondary font-mono text-xs">Esc</kbd>
          结束
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt text-text-secondary font-mono text-xs">F</kbd>
          全屏
        </span>
        <button
          onClick={onToggleHelp}
          className="flex items-center gap-1 hover:text-primary-text transition-colors"
        >
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt text-text-secondary font-mono text-xs">?</kbd>
          快捷键
        </button>
      </div>
    </div>
    {/* Esc double-press confirmation toast */}
    {showEscConfirm && (
      <div className="fixed bottom-5 left-0 right-0 z-[110] flex justify-center pointer-events-none px-4">
        <div className="bg-dark/90 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg animate-fade-in">
          再按一次 Esc 确认结束
        </div>
      </div>
    )}
    </>
  );
}
