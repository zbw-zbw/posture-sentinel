"use client";

import { useState } from "react";
import { formatDateCN, isToday } from "@/lib/report";

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
  availableDates?: string[];
}

export default function DatePicker({ date, onChange, availableDates }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const goPrev = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    onChange(d.toISOString().split("T")[0]);
  };
  
  const goNext = () => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split("T")[0];
    if (next > new Date().toISOString().split("T")[0]) return; // can't go to future
    onChange(next);
  };
  
  // Generate last 30 days
  const last30Days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last30Days.push(d.toISOString().split("T")[0]);
  }
  
  const isAvailable = (d: string) => !availableDates || availableDates.includes(d);
  
  return (
    <div className="relative w-full md:w-auto">
      <div className="flex items-center gap-3">
        <button onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-alt hover:bg-border text-text-secondary transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-border text-text-primary font-medium transition-colors">
          {formatDateCN(date)}
          {isToday(date) && <span className="bg-primary-light text-primary-dark text-xs px-2 py-0.5 rounded-full">今天</span>}
        </button>
        <button onClick={goNext} className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-alt hover:bg-border text-text-secondary transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
      
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-surface rounded-2xl border border-border shadow-xl p-4 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1">
              {last30Days.map((d) => {
                const dayNum = new Date(d + "T00:00:00").getDate();
                const selected = d === date;
                const hasData = isAvailable(d);
                const isFuture = d > new Date().toISOString().split("T")[0];
                return (
                  <button
                    key={d}
                    onClick={() => { if (!isFuture) { onChange(d); setShowPicker(false); } }}
                    disabled={isFuture}
                    className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                      selected
                        ? "bg-primary text-white"
                        : isFuture
                        ? "text-text-muted cursor-not-allowed"
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
        </>
      )}
    </div>
  );
}
