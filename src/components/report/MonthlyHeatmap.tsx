"use client";

import { useMemo } from "react";
import { getSessions } from "@/lib/storage";

interface MonthlyHeatmapProps {
  year: number;
  month: number; // 0-indexed
}

interface DayData {
  date: string;      // YYYY-MM-DD
  day: number;       // 1-31
  score: number;     // 0-100 or -1 if no data
  duration: number;  // seconds
}

export default function MonthlyHeatmap({ year, month }: MonthlyHeatmapProps) {
  const data = useMemo(() => {
    const sessions = getSessions();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: DayData[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySessions = sessions.filter(s => s.date === dateStr);
      const totalDuration = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      let score = -1;
      if (daySessions.length > 0) {
        const validSessions = daySessions.filter(s => s.avgScore > 0);
        if (validSessions.length > 0) {
          score = Math.round(validSessions.reduce((sum, s) => sum + s.avgScore, 0) / validSessions.length);
        }
      }
      days.push({ date: dateStr, day: d, score, duration: totalDuration });
    }
    return days;
  }, [year, month]);

  // Get day of week for the 1st of the month (0=Sun, adjust to Mon=0)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon=0

  const getColor = (score: number) => {
    if (score < 0) return "bg-surface-alt";
    if (score >= 80) return "bg-primary";
    if (score >= 60) return "bg-primary/60";
    if (score >= 40) return "bg-warning";
    if (score >= 20) return "bg-warning/60";
    return "bg-danger/60";
  };

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  return (
    <div className="bg-surface rounded-2xl p-5 card-hover">
      <h3 className="text-sm font-medium text-text-secondary mb-3">
        {year}年{monthNames[month]}趋势
      </h3>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-3 text-xs text-text-muted">
        <span>差</span>
        <div className="w-4 h-4 rounded bg-danger/60" />
        <div className="w-4 h-4 rounded bg-warning/60" />
        <div className="w-4 h-4 rounded bg-warning" />
        <div className="w-4 h-4 rounded bg-primary/60" />
        <div className="w-4 h-4 rounded bg-primary" />
        <span>好</span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["一", "二", "三", "四", "五", "六", "日"].map(d => (
          <div key={d} className="text-center text-xs text-text-muted font-medium h-6">
            {d}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {/* Day cells */}
        {data.map(d => (
          <div
            key={d.date}
            className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${getColor(d.score)} ${
              d.score < 0 ? "text-text-muted" : d.score >= 60 ? "text-white" : "text-white/80"
            }`}
            title={d.score >= 0 ? `${d.date}: ${d.score}分, ${Math.round(d.duration / 60)}分钟` : `${d.date}: 无数据`}
          >
            {d.day}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <span>
          有数据 {(data.filter(d => d.score >= 0).length)} 天
        </span>
        <span>
          平均 {(() => {
            const validDays = data.filter(d => d.score >= 0);
            if (validDays.length === 0) return "—";
            return Math.round(validDays.reduce((sum, d) => sum + d.score, 0) / validDays.length);
          })()} 分
        </span>
      </div>
    </div>
  );
}
