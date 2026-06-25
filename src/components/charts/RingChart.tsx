"use client";

import { useEffect, useState } from "react";

interface RingChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  animate?: boolean;
  label?: string;
  sublabel?: string;
}

export default function RingChart({
  value,
  max = 100,
  size = 180,
  strokeWidth = 12,
  color,
  bgColor = "#e2e8f0",
  animate = true,
  label,
  sublabel,
}: RingChartProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  const resolvedColor =
    color || (value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444");
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayValue / max) * circumference;

  useEffect(() => {
    if (!animate) {
      const t = setTimeout(() => setDisplayValue(value), 0);
      return () => clearTimeout(t);
    }
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const current = Math.round(eased * value);
      setDisplayValue(current);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, animate]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          shapeRendering="geometricPrecision"
          style={{
            transition: animate ? "stroke-dasharray 1.5s ease-out" : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label !== undefined && (
          <span className="text-3xl font-bold text-text-primary">{label}</span>
        )}
        {sublabel && (
          <span className="text-sm text-text-muted mt-1">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
