"use client";

import Link from "next/link";

interface EmptyStateProps {
  date: string;
}

export default function EmptyState({ date }: EmptyStateProps) {
  const isToday = date === new Date().toISOString().split("T")[0];
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">📷</div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {isToday ? "今天还没有检测记录" : `${date} 没有检测记录`}
      </h3>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">
        {isToday
          ? "打开摄像头开始检测，AI 会实时守护你的坐姿"
          : "这一天没有检测到坐姿数据，试试选择其他日期"}
      </p>
      {isToday && (
        <Link
          href="/detect"
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          开始检测 →
        </Link>
      )}
    </div>
  );
}
