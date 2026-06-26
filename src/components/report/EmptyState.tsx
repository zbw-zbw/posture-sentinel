"use client";

import Link from "next/link";

interface EmptyStateProps {
  date: string;
}

export default function EmptyState({ date }: EmptyStateProps) {
  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="bg-surface rounded-2xl border border-border p-12 text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-alt border-2 border-dashed border-border flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-12 h-12 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">暂无检测数据</h3>
      <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
        {isToday
          ? "今天还没有进行检测。打开摄像头，让 AI 帮你守护坐姿健康。"
          : "这一天没有检测记录。选择其他日期，或从今天开始检测。"}
      </p>
      <Link
        href="/detect"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        开始检测
      </Link>
    </div>
  );
}
