"use client";

import { useState } from "react";
import { formatDateCN, isToday } from "@/lib/report";

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
  availableDates?: string[];
}

// Format a Date object to YYYY-MM-DD using LOCAL time (not UTC)
function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get today's date string in local time
function getTodayString(): string {
  return toLocalDateString(new Date());
}

export default function DatePicker({ date, onChange, availableDates }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const goPrev = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    onChange(toLocalDateString(d));
  };

  const goNext = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const next = toLocalDateString(d);
    const today = getTodayString();
    if (next > today) return; // can't go to future
    onChange(next);
  };

  // Generate last 30 days
  const last30Days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last30Days.push(toLocalDateString(d));
  }

  const isAvailable = (d: string) => !availableDates || availableDates.includes(d);
  const today = getTodayString();

  return (
    <div className="relative w-full md:w-auto">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={goPrev}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-surface-alt hover:bg-border text-text-secondary transition-colors"
          aria-label="上一天"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-surface-alt hover:bg-border text-text-primary font-medium transition-colors text-sm md:text-base"
        >
          {formatDateCN(date)}
          {isToday(date) && <span className="bg-primary-light text-primary-dark text-xs px-2 py-0.5 rounded-full">今天</span>}
        </button>
        <button
          onClick={goNext}
          disabled={date >= today}
          className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors ${
            date >= today
              ? "bg-surface-alt text-text-muted opacity-40"
              : "bg-surface-alt hover:bg-border text-text-secondary"
          }`}
          aria-label="下一天"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-surface rounded-2xl shadow-xl p-4 max-h-72 overflow-y-auto">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                <div key={d} className="h-6 flex items-center justify-center text-xs text-text-muted font-medium">
                  {d}
                </div>
              ))}
            </div>
            {/* Group by month */}
            {(() => {
              const groups: { month: string; days: string[] }[] = [];
              let currentMonth = "";
              for (const d of last30Days) {
                const monthLabel = `${new Date(d + "T00:00:00").getFullYear()}年${new Date(d + "T00:00:00").getMonth() + 1}月`;
                if (monthLabel !== currentMonth) {
                  groups.push({ month: monthLabel, days: [d] });
                  currentMonth = monthLabel;
                } else {
                  groups[groups.length - 1].days.push(d);
                }
              }
              return groups.map((group) => (
                <div key={group.month}>
                  {groups.length > 1 && (
                    <div className="text-xs text-text-muted font-medium mb-1 mt-2 first:mt-0">
                      {group.month}
                    </div>
                  )}
                  <div className="grid grid-cols-7 gap-1">
                    {group.days.map((d) => {
                      // Pad leading empty cells for correct day-of-week alignment
                      const dayOfWeek = new Date(d + "T00:00:00").getDay();
                      const colIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6
                      // Only render cells for this month's days
                      const dayNum = new Date(d + "T00:00:00").getDate();
                      const selected = d === date;
                      const hasData = isAvailable(d);
                      const isFuture = d > today;
                      return (
                        <button
                          key={d}
                          onClick={() => { if (!isFuture) { onChange(d); setShowPicker(false); } }}
                          disabled={isFuture}
                          className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                            selected
                              ? "bg-primary text-white"
                              : isFuture
                              ? "text-text-muted opacity-40"
                              : hasData
                              ? "bg-surface-alt text-text-primary hover:bg-border"
                              : "text-text-muted hover:bg-surface-alt"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      )}
    </div>
  );
}
