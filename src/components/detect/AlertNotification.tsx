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
    <div
      className="fixed bottom-5 left-1/2 z-[100] animate-slide-up"
      style={{ transform: "translateX(-50%)" }}
    >
      <div
        className={`w-[90vw] max-w-[500px] rounded-2xl border-l-4 p-5 shadow-xl ${
          isWarning
            ? "bg-warning-light border-l-warning"
            : "bg-danger-light border-l-danger"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <span className="text-2xl flex-shrink-0 mt-0.5">
            {isWarning ? "🟡" : "🔴"}
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
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
