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
  
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const prevWeekAvg = 75; // Placeholder for comparison (could be computed from historical data)
  const change = Math.round(((avgScore - prevWeekAvg) / prevWeekAvg) * 100);
  
  return (
    <div>
      <BarChart data={chartData} height={180} barWidth={28} showValue={true} />
      <p className="text-center text-sm text-text-secondary mt-3">
        本周平均 <span className="font-semibold text-text-primary">{avgScore}</span> 分
        {change !== 0 && (
          <span className={`ml-2 ${change >= 0 ? "text-primary" : "text-danger"}`}>
            较上周 {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </p>
    </div>
  );
}
