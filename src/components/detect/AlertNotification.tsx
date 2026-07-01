"use client";

import { useCallback, useEffect, useState } from "react";

interface AlertNotificationProps {
  isVisible: boolean;
  message: string;
  type: "warning" | "bad";
  alertCount: number;
  statusDuration: number;
  onDismiss: () => void;
}

export default function AlertNotification({
  isVisible,
  message,
  type,
  alertCount,
  statusDuration,
  onDismiss,
}: AlertNotificationProps) {
  const [remaining, setRemaining] = useState(100);
  const [visible, setVisible] = useState(false);

  // Sync visibility state with isVisible prop
  useEffect(() => {
    if (isVisible) {
      setVisible(true);
    }
  }, [isVisible]);

  // Prevent body scroll when alert is visible on mobile
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Handle dismiss with exit animation
  const handleDismiss = useCallback(() => {
    setVisible(false); // trigger exit animation
    setTimeout(() => onDismiss(), 300); // wait for animation, then actually dismiss
  }, [onDismiss]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!isVisible) return;
    const startTime = Date.now();
    const DURATION = 10000; // 10 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setRemaining(pct);
      if (pct <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, handleDismiss]);

  if (!isVisible) return null;

  const isWarning = type === "warning";

  return (
    <div className="fixed bottom-5 left-0 right-0 z-[100] flex justify-center">
      <div
        className={`w-[90vw] max-w-[500px] rounded-2xl border-l-4 p-5 shadow-xl relative overflow-hidden transition-all duration-300 ease-in-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        } ${
          isWarning
            ? "bg-warning-light border-l-warning"
            : "bg-danger-light border-l-danger"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <span className="flex-shrink-0 mt-0.5">
            {isWarning ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-warning" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-medium text-base leading-relaxed">
              {message}
            </p>
            <p className="text-text-muted text-xs mt-2">
              持续不良坐姿 {statusDuration}秒 | 本次第{alertCount}次提醒
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="关闭提醒"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Countdown progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-white/40 transition-all duration-100 ease-linear"
            style={{ width: `${remaining}%` }}
          />
        </div>
      </div>
    </div>
  );
}
