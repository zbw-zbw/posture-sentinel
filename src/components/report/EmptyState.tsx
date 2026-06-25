"use client";

import Link from "next/link";

interface EmptyStateProps {
  date: string;
}

export default function EmptyState({ date }: EmptyStateProps) {
  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-alt flex items-center justify-center mb-6 border-2 border-dashed border-border">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {isToday ? "暂无检测数据" : `${date} 暂无检测数据`}
      </h3>
      <p className="text-text-secondary text-sm mb-8 max-w-sm leading-relaxed">
        {isToday
          ? "打开摄像头开始检测，AI 会实时守护你的坐姿"
          : "这一天没有检测到坐姿数据，试试选择其他日期"}
      </p>
      {isToday && (
        <Link
          href="/detect"
          className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
        >
          开始检测
          <svg viewBox="0 0 24 24" className="w-5 h-5 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}
    </div>
  );
}
