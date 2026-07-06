"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { getMonthCalendar, type MonthCalendarData } from "@/lib/report";

function getScoreBg(score: number, hasSessions: boolean): string {
  if (!hasSessions) return "bg-surface-alt";
  if (score >= 80) return "bg-primary-light";
  if (score >= 60) return "bg-warning-light";
  return "bg-danger-light";
}

function getScoreBorder(score: number, hasSessions: boolean): string {
  if (!hasSessions) return "border-border";
  if (score >= 80) return "border-primary/30";
  if (score >= 60) return "border-warning/30";
  return "border-danger/30";
}

function CalendarHeatmapImpl() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarData: MonthCalendarData = useMemo(
    () => getMonthCalendar(year, month),
    [year, month]
  );

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDate(null);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    // Don't allow navigating to future months
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nowDate = new Date();
    if (nextYear > nowDate.getFullYear() ||
        (nextYear === nowDate.getFullYear() && nextMonth > nowDate.getMonth())) {
      return;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDate(null);
  }, [month, year]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const selectedDay = selectedDate
    ? calendarData.days.find(d => d.date === selectedDate)
    : null;

  return (
    <div>
      {/* Header: month navigation + summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-alt text-text-secondary transition-colors"
            aria-label="上个月"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h3 className="text-lg font-bold text-text-primary tabular-nums">
            {calendarData.year}年 {calendarData.monthName}
          </h3>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-alt text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="下个月"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Month summary stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-text-muted text-xs">活跃天数</div>
            <div className="font-bold text-text-primary tabular-nums">{calendarData.activeDays}</div>
          </div>
          <div className="text-center">
            <div className="text-text-muted text-xs">总检测</div>
            <div className="font-bold text-text-primary tabular-nums">{calendarData.totalSessions}次</div>
          </div>
          <div className="text-center">
            <div className="text-text-muted text-xs">月均分</div>
            <div className="font-bold text-primary-text tabular-nums">{calendarData.avgScore || "—"}</div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells for offset */}
        {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {/* Day cells */}
        {calendarData.days.map(day => {
          const hasSessions = day.sessionCount > 0;
          const isSelected = selectedDate === day.date;
          const isToday = day.isToday;

          return (
            <button
              key={day.date}
              onClick={() => !day.isFuture && setSelectedDate(isSelected ? null : day.date)}
              disabled={day.isFuture}
              className={`
                relative aspect-square rounded-lg border-2 transition-all
                ${getScoreBg(day.score, hasSessions)}
                ${getScoreBorder(day.score, hasSessions)}
                ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}
                ${day.isFuture ? "opacity-30 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
                ${isToday && !isSelected ? "border-primary" : ""}
                flex flex-col items-center justify-center
              `}
              title={hasSessions
                ? `${day.day}日 · ${day.score}分 · ${day.sessionCount}次检测 · ${day.duration}分钟`
                : day.isFuture ? `${day.day}日` : `${day.day}日 · 无记录`
              }
            >
              <span className={`text-xs font-medium ${hasSessions ? "text-text-primary" : "text-text-muted"}`}>
                {day.day}
              </span>
              {hasSessions && (
                <span className="text-[10px] text-text-secondary tabular-nums leading-none mt-0.5">
                  {day.score}
                </span>
              )}
              {isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-light border border-primary/30" />
          <span>良好 (≥80)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-warning-light border border-warning/30" />
          <span>一般 (60-79)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-danger-light border border-danger/30" />
          <span>较差 (&lt;60)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-surface-alt border border-border" />
          <span>无记录</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4 bg-surface-alt rounded-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-text-primary">
              {(() => {
                const [y, m, d] = selectedDay.date.split("-");
                return `${y}年${parseInt(m)}月${parseInt(d)}日`;
              })()}
            </h4>
            <span className={`text-sm font-bold ${
              selectedDay.score >= 80 ? "text-primary-text"
              : selectedDay.score >= 60 ? "text-warning-text"
              : "text-danger-text"
            }`}>
              {selectedDay.score}分
            </span>
          </div>
          <div className="flex gap-4 text-sm text-text-secondary">
            <span>检测 {selectedDay.sessionCount} 次</span>
            <span>时长 {selectedDay.duration} 分钟</span>
          </div>
        </div>
      )}
    </div>
  );
}

const CalendarHeatmap = memo(CalendarHeatmapImpl);
export default CalendarHeatmap;
