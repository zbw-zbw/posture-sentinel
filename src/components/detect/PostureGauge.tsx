"use client";

import { memo, useEffect, useRef, useState } from "react";

interface PostureGaugeProps {
  score: number;
  isDetecting: boolean;
  isDetected: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "优秀";
  if (score >= 60) return "一般";
  return "需改善";
}

function PostureGaugeImpl({ score, isDetecting, isDetected }: PostureGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef(0);
  const prevRef = useRef(0);

  // Smooth score transition
  useEffect(() => {
    if (!isDetecting) {
      setDisplayScore(0);
      prevRef.current = 0;
      return;
    }

    const from = prevRef.current;
    const to = score;
    if (from === to) return;

    const duration = 300;
    const start = performance.now();
    const diff = to - from;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      setDisplayScore(Math.round(from + diff * ease));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score, isDetecting]);

  if (!isDetecting) {
    return (
      <div className="bg-surface-alt rounded-2xl p-5 flex flex-col items-center justify-center min-h-[140px]">
        <div className="w-20 h-20 rounded-full border-4 border-border flex items-center justify-center">
          <span className="text-2xl font-bold text-text-muted">--</span>
        </div>
        <p className="text-xs text-text-muted mt-3">体态评分</p>
      </div>
    );
  }

  const color = getScoreColor(displayScore);
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="bg-surface-alt rounded-2xl p-5 flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {isDetected ? displayScore : "--"}
          </span>
          <span className="text-[10px] text-text-muted -mt-0.5">/100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: isDetected ? color : "#9ca3af" }}
        />
        <p className="text-xs font-medium" style={{ color: isDetected ? color : undefined }}>
          {isDetected ? getScoreLabel(displayScore) : "未检测到人体"}
        </p>
      </div>
    </div>
  );
}

const PostureGauge = memo(PostureGaugeImpl);
export default PostureGauge;
