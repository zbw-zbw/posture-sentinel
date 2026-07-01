"use client";

import { useCallback, useEffect, useState } from "react";

interface AchievementToastProps {
  achievement: { id: string; name: string; description: string; icon: string } | null;
  onDismiss: () => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  // `visible` toggles the opacity/scale for the fade in/out transition.
  const [visible, setVisible] = useState(false);

  // Fade out, then notify the parent after the transition completes so the
  // element stays mounted (and animating) until the exit finishes.
  const dismiss = useCallback(() => {
    setVisible(false);
    window.setTimeout(onDismiss, 300);
  }, [onDismiss]);

  // Entrance: fade in. We defer the state update across two animation frames
  // so the browser first paints the hidden (opacity-0) state and the
  // transition actually runs. The setState lives inside a rAF callback (async),
  // never synchronously in the effect body.
  useEffect(() => {
    if (!achievement) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [achievement]);

  // Auto-dismiss after 3 seconds.
  useEffect(() => {
    if (!achievement) return;
    const timer = window.setTimeout(dismiss, 3000);
    return () => window.clearTimeout(timer);
  }, [achievement, dismiss]);

  // Nothing to render.
  if (!achievement) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-surface rounded-2xl px-8 py-7 max-w-xs w-full shadow-2xl text-center transition-all duration-300 ${
          visible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        {/* Large emoji icon */}
        <div className="text-6xl mb-4 leading-none">{achievement.icon}</div>

        {/* Title */}
        <p className="text-sm font-medium text-primary mb-1">
          🎉 解锁成就！
        </p>

        {/* Achievement name */}
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {achievement.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted">{achievement.description}</p>

        {/* Tap to dismiss hint */}
        <p className="text-xs text-text-muted/70 mt-4">点击任意处关闭</p>
      </div>
    </div>
  );
}
