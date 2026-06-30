"use client";

import RingChart from "@/components/charts/RingChart";
import type { DailyGoalProgress } from "@/lib/storage";

interface DailyGoalCardProps {
  progress: DailyGoalProgress;
}

export default function DailyGoalCard({ progress }: DailyGoalCardProps) {
  const ringColor = progress.isCompleted ? "#10b981" : progress.percent > 50 ? "#f59e0b" : "#94a3b8";

  return (
    <div className="bg-surface rounded-2xl p-5 card-hover">
      <h3 className="text-sm font-medium text-text-secondary mb-3">今日目标</h3>
      <div className="flex items-center gap-4">
        <RingChart
          value={progress.percent}
          max={100}
          size={80}
          strokeWidth={8}
          animate={true}
          label={`${progress.percent}%`}
          sublabel=""
          color={ringColor}
        />
        <div className="flex-1">
          <p className="text-lg font-bold text-text-primary">
            {progress.todayMinutes} / {progress.goalMinutes} 分钟
          </p>
          {progress.isCompleted ? (
            <p className="text-sm text-primary font-medium mt-1">
              {progress.streakDays > 0 ? `🎉 ${progress.streakLabel}` : "✓ 今日目标已达成！"}
            </p>
          ) : (
            <p className="text-sm text-text-secondary mt-1">
              还差 {progress.goalMinutes - progress.todayMinutes} 分钟达标
            </p>
          )}
        </div>
      </div>
      {progress.streakDays > 1 && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {progress.streakLabel}
          </span>
          {progress.streakDays >= 7 && (
            <span className="text-xs bg-warning-light text-warning px-2 py-0.5 rounded-full font-medium">
              🔥 连续 {progress.streakDays} 天
            </span>
          )}
        </div>
      )}
    </div>
  );
}
