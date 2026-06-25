"use client";

interface PostureTimelineProps {
  scoreHistory: { time: number; score: number }[];
  duration: number;
}

export default function PostureTimeline({ scoreHistory, duration }: PostureTimelineProps) {
  if (scoreHistory.length < 2 || duration < 5) return null;

  return (
    <div className="mb-4">
      <p className="text-sm text-text-secondary mb-2">姿态时间线</p>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {scoreHistory.map((entry, i) => {
          const color =
            entry.score >= 80 ? "#10b981" : entry.score >= 60 ? "#f59e0b" : "#ef4444";
          const width = i === scoreHistory.length - 1
            ? "auto"
            : `${100 / scoreHistory.length}%`;
          return (
            <div
              key={entry.time}
              className="rounded-full transition-all"
              style={{ backgroundColor: color, width, minWidth: 4 }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>开始</span>
        <span>结束</span>
      </div>
    </div>
  );
}
