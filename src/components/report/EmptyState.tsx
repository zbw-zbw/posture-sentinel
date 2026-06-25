"use client";

import Link from "next/link";

interface EmptyStateProps {
  date: string;
}

export default function EmptyState({ date }: EmptyStateProps) {
  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-alt flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {isToday ? "今天还没有检测记录" : `${date} 没有检测记录`}
      </h3>
      <p className="text-text-secondary text-sm mb-8 max-w-sm leading-relaxed">
        {isToday
          ? "打开摄像头开始检测，AI 会实时守护你的坐姿"
          : "这一天没有检测到坐姿数据，试试选择其他日期"}
      </p>
      {isToday && (
        <Link
          href="/detect"
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          开始检测
          <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block ml-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}
    </div>
  );
}
