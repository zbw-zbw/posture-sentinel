"use client";

import { memo, useEffect, useState } from "react";

interface VoiceIndicatorProps {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  onToggle: () => void;
}

function VoiceIndicatorImpl({ isListening, isSupported, lastCommand, onToggle }: VoiceIndicatorProps) {
  // Tooltip visibility — auto-dismisses 3s after the last command changes.
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (!lastCommand) return;
    setShowTip(true);
    const timer = window.setTimeout(() => {
      setShowTip(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [lastCommand]);

  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          title={isListening ? "关闭语音控制" : "开启语音控制"}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
            isListening
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-surface-alt text-text-muted hover:text-text-secondary hover:bg-border"
          }`}
          aria-label={isListening ? "关闭语音控制" : "开启语音控制"}
        >
          {/* Mic icon */}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          {/* Pulsing ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
          )}
        </button>
        {/* Last command tooltip */}
        {showTip && lastCommand && (
          <div className="animate-fade-in bg-dark/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <span className="opacity-60 mr-1">语音:</span> {lastCommand}
          </div>
        )}
      </div>
      {/* Voice command hints */}
      {isListening && (
        <div className="text-right text-[10px] leading-tight text-text-muted max-w-[180px]">
          试着说：<span className="text-primary-text">开始检测</span> / <span className="text-primary-text">暂停</span> / <span className="text-primary-text">继续</span> / <span className="text-primary-text">结束</span>
        </div>
      )}
    </div>
  );
}

const VoiceIndicator = memo(VoiceIndicatorImpl);
export default VoiceIndicator;
