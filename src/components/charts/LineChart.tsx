"use client";

import { useRef, useState } from "react";

export const CHART_COLORS = {
  primary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  primaryLight: "#d1fae5",
  warningLight: "#fef3c7",
  dangerLight: "#fee2e2",
  grid: "#e2e8f0",
  text: "#94a3b8",
} as const;

interface LineChartProps {
  data: { x: number | string; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  yMax?: number;
  yTicks?: number[];
  thresholdLines?: { value: number; color: string; label: string }[];
}

export default function LineChart({
  data,
  width = 600,
  height = 200,
  color = CHART_COLORS.primary,
  showArea = true,
  showGrid = true,
  yMax = 100,
  yTicks = [0, 25, 50, 75, 100],
  thresholdLines = [],
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  if (!data || data.length < 2)
    return <div className="text-text-muted text-sm text-center py-8">数据不足</div>;

  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xMax = data.length - 1;

  const getX = (i: number) => padding.left + (i / xMax) * chartW;
  const getY = (v: number) => padding.top + (1 - v / yMax) * chartH;

  // Build polyline points
  const points = data.map((d, i) => `${getX(i)},${getY(d.y)}`).join(" ");

  // Build area polygon
  const areaPoints = showArea
    ? `${getX(0)},${padding.top + chartH} ${points} ${getX(data.length - 1)},${padding.top + chartH}`
    : "";

  const handlePointEnter = (i: number, clientX: number, clientY: number) => {
    const d = data[i];
    setTooltip({ x: clientX, y: clientY - 40, text: `${d.x}: ${d.y}分` });
  };

  const handlePointLeave = () => setTooltip(null);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid &&
          yTicks.map((t) => (
            <line
              key={t}
              x1={padding.left}
              y1={getY(t)}
              x2={width - padding.right}
              y2={getY(t)}
              stroke={CHART_COLORS.grid}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

        {/* Threshold lines */}
        {thresholdLines.map((tl) => (
          <g key={tl.value}>
            <line
              x1={padding.left}
              y1={getY(tl.value)}
              x2={width - padding.right}
              y2={getY(tl.value)}
              stroke={tl.color}
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <text
              x={width - padding.right + 4}
              y={getY(tl.value) + 4}
              fontSize="10"
              fill={tl.color}
            >
              {tl.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {showArea && <polygon points={areaPoints} fill="url(#lineArea)" />}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          shapeRendering="geometricPrecision"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.y)}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
            onMouseEnter={(e) => handlePointEnter(i, e.clientX, e.clientY)}
            onMouseLeave={handlePointLeave}
            onTouchStart={() => handlePointEnter(i, getX(i), getY(d.y))}
            className="cursor-pointer hover:r-6 transition-all"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t) => (
          <text
            key={t}
            x={padding.left - 8}
            y={getY(t) + 4}
            fontSize="10"
            fill={CHART_COLORS.text}
            textAnchor="end"
          >
            {t}
          </text>
        ))}

        {/* X-axis labels */}
        {data.length >= 3 && (() => {
          const interval = Math.max(1, Math.floor(data.length / 6));
          const labels: { index: number; label: string }[] = [];
          for (let i = 0; i < data.length; i += interval) {
            labels.push({ index: i, label: String(data[i].x) });
          }
          // Ensure the last data point is always shown
          if (labels[labels.length - 1].index !== data.length - 1) {
            labels.push({ index: data.length - 1, label: String(data[data.length - 1].x) });
          }
          return labels.map(({ index, label }) => (
            <text
              key={index}
              x={getX(index)}
              y={height - 8}
              fontSize="10"
              fill={CHART_COLORS.text}
              textAnchor="middle"
            >
              {label}
            </text>
          ));
        })()}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-dark text-white rounded-lg px-3 py-1.5 text-xs pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
