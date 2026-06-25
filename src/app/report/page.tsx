"use client";

import Link from "next/link";
import DailyReport from "@/components/report/DailyReport";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        {/* Breadcrumb + Header */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">首页</Link>
          <span>/</span>
          <span className="text-text-primary">健康日报</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">脊椎健康日报</h1>
          <p className="text-text-secondary mt-1 text-sm">查看你的坐姿数据趋势和 AI 改善建议</p>
        </div>

        {/* Daily Report */}
        <DailyReport />
      </div>
    </div>
  );
}
