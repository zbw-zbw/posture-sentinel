"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (isVisible) {
      // Prevent body scroll when alert is visible on mobile
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isWarning = type === "warning";

  return (
    <div className="fixed bottom-5 left-0 right-0 z-[100] flex justify-center animate-slide-up">
      <div
        className={`w-[90vw] max-w-[500px] rounded-2xl border-l-4 p-5 shadow-xl ${
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
            onClick={onDismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="关闭提醒"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
