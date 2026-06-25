"use client";

import { useEffect, useState } from "react";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  barWidth?: number;
  showValue?: boolean;
  yMax?: number;
}

export default function BarChart({
  data,
  width = 400,
  height = 200,
  barWidth = 32,
  showValue = true,
  yMax = 100,
}: BarChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!data || data.length === 0)
    return <div className="text-text-muted text-sm text-center py-8">暂无数据</div>;

  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const gap = (chartW - data.length * barWidth) / (data.length + 1);

  const getBarHeight = (v: number) => (v / yMax) * chartH;
  const getBarX = (i: number) => padding.left + gap + i * (barWidth + gap);
  const getBarY = (v: number) => padding.top + chartH - getBarHeight(v);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((t) => (
          <line
            key={t}
            x1={padding.left}
            y1={padding.top + chartH - (t / yMax) * chartH}
            x2={width - padding.right}
            y2={padding.top + chartH - (t / yMax) * chartH}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {data.map((d, i) => {
          const barColor =
            d.color ||
            (d.value >= 80 ? "#10b981" : d.value >= 60 ? "#f59e0b" : "#ef4444");
          const h = animated ? getBarHeight(d.value) : 0;
          const x = getBarX(i);
          const y = getBarY(d.value);
          const isToday = d.label === "今天";

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={4}
                fill={barColor}
                style={{ transition: "all 0.6s ease-out" }}
                shapeRendering="geometricPrecision"
              />
              {isToday && (
                <polygon
                  points={`${x + barWidth / 2 - 4},${y - 8} ${x + barWidth / 2 + 4},${y - 8} ${x + barWidth / 2},${y - 2}`}
                  fill="#0f172a"
                />
              )}
              {showValue && d.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  fontSize="11"
                  fill="#475569"
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - 8}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
