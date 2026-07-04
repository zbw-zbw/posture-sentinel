"use client";

import { memo } from "react";
import type { HourlyScore } from "@/lib/report";

interface HourlyHeatmapProps {
  data: HourlyScore[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-primary)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-danger)";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-primary-light";
  if (score >= 60) return "bg-warning-light";
  return "bg-danger-light";
}

function HourlyHeatmapImpl({ data }: HourlyHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        暂无足够数据生成时段分析
      </div>
    );
  }

  // Find worst and best hours
  const sorted = [...data].sort((a, b) => a.avgScore - b.avgScore);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];
  const maxCount = Math.max(...data.map(d => d.sessionCount));

  return (
    <div>
      {/* Insight banner */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 bg-primary-light rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-text-secondary">最佳时段</span>
          <span className="font-semibold text-primary-text">{best.label}</span>
          <span className="text-text-muted">{best.avgScore}分</span>
        </div>
        <div className="flex items-center gap-2 bg-danger-light rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-text-secondary">需改善</span>
          <span className="font-semibold text-danger-text">{worst.label}</span>
          <span className="text-text-muted">{worst.avgScore}分</span>
        </div>
      </div>

      {/* Hourly bars */}
      <div className="flex items-end gap-1 h-32 mb-2">
        {data.map(d => {
          const heightPct = Math.max(15, (d.avgScore / 100) * 100);
          return (
            <div
              key={d.hour}
              className="flex-1 group relative flex flex-col items-center justify-end"
              title={`${d.label} · ${d.avgScore}分 · ${d.sessionCount}次`}
            >
              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${getScoreBg(d.avgScore)}`}
                style={{ height: `${heightPct}%` }}
              >
                <div
                  className="w-full h-1 rounded-t-md"
                  style={{ backgroundColor: getScoreColor(d.avgScore) }}
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-dark text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                {d.avgScore}分
              </div>
            </div>
          );
        })}
      </div>
      {/* Hour labels */}
      <div className="flex gap-1">
        {data.map(d => (
          <div key={d.hour} className="flex-1 text-center">
            <span className="text-[10px] text-text-muted">{d.hour}</span>
          </div>
        ))}
      </div>
      {/* Session count indicator */}
      <div className="flex gap-1 mt-1">
        {data.map(d => (
          <div key={d.hour} className="flex-1 flex justify-center">
            <span className="text-[9px] text-text-muted/60">
              {d.sessionCount > 0 ? `${d.sessionCount}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HourlyHeatmap = memo(HourlyHeatmapImpl);
export default HourlyHeatmap;
