"use client";

import BarChart from "@/components/charts/BarChart";
import type { WeeklyScore } from "@/lib/report";

interface WeeklyTrendProps {
  scores: WeeklyScore[];
}

export default function WeeklyTrend({ scores }: WeeklyTrendProps) {
  const chartData = scores.map((s) => ({
    label: s.dayName,
    value: s.score,
  }));

  // Only average days that have actual data (score > 0)
  const daysWithData = scores.filter((s) => s.score > 0);
  const avgScore = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((sum, s) => sum + s.score, 0) / daysWithData.length)
    : 0;

  return (
    <div>
      <BarChart data={chartData} height={180} barWidth={28} showValue={true} />
      <p className="text-center text-sm text-text-secondary mt-3">
        本周平均 <span className="font-semibold text-text-primary">{avgScore}</span> 分
        {daysWithData.length > 0 && (
          <span className="ml-2 text-text-muted">
            （{daysWithData.length} 天有数据）
          </span>
        )}
      </p>
    </div>
  );
}
