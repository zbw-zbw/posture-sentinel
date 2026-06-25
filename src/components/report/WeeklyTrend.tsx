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
          <span className={`ml-2 inline-flex items-center gap-0.5 ${change >= 0 ? "text-primary" : "text-danger"}`}>
            较上周
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {change >= 0 ? (
                <>
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </>
              )}
            </svg>
            {Math.abs(change)}%
          </span>
        )}
      </p>
    </div>
  );
}
