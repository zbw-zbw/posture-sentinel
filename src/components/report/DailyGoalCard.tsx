"use client";

import RingChart from "@/components/charts/RingChart";
import type { DailyGoalProgress } from "@/lib/storage";

interface DailyGoalCardProps {
  progress: DailyGoalProgress;
}

export default function DailyGoalCard({ progress }: DailyGoalCardProps) {
  const ringColor = progress.isCompleted ? "#10b981" : progress.percent > 50 ? "#f59e0b" : "#64748b";

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
            <p className="text-sm text-primary-text font-medium mt-1 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {progress.streakDays > 0 ? progress.streakLabel : "今日目标已达成！"}
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
            <span className="text-xs bg-warning-light text-warning-text px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              连续 {progress.streakDays} 天
            </span>
          )}
        </div>
      )}
    </div>
  );
}
