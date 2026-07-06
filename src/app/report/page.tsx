"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import DailyReport from "@/components/report/DailyReport";

function ReportContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  return <DailyReport initialDate={dateParam || undefined} />;
}

function ReportFallback() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-surface-alt rounded-xl w-48" />
        <div className="h-8 bg-surface-alt rounded-xl w-24" />
      </div>
      {/* Score + goals row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-40 bg-surface-alt rounded-2xl" />
        <div className="h-40 bg-surface-alt rounded-2xl" />
        <div className="h-40 bg-surface-alt rounded-2xl" />
      </div>
      {/* Distribution bar */}
      <div className="h-24 bg-surface-alt rounded-2xl" />
      {/* AI advice */}
      <div className="h-32 bg-surface-alt rounded-2xl" />
      {/* Trend chart */}
      <div className="h-48 bg-surface-alt rounded-2xl" />
      {/* Session list */}
      <div className="h-32 bg-surface-alt rounded-2xl" />
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light/10 to-transparent -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">脊椎健康日报</h1>
              <p className="text-text-secondary mt-1 text-sm">查看你的坐姿数据趋势和 AI 改善建议</p>
            </div>
            <Link
              href="/detect"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary-dark hover:bg-primary text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              再测一次
            </Link>
          </div>
        </section>

        {/* Daily Report */}
        <Suspense fallback={<ReportFallback />}>
          <ReportContent />
        </Suspense>
      </div>
    </div>
  );
}
