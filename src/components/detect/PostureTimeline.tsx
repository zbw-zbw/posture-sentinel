"use client";

import { useState } from "react";

interface PostureTimelineProps {
  scoreHistory: { time: number; score: number }[];
  duration: number;
}

function getScoreColor(score: number): string {
  return score >= 80
    ? "bg-primary"
    : score >= 60
    ? "bg-warning"
    : "bg-danger";
}

function getScoreLabel(score: number): string {
  return score >= 80
    ? "良好"
    : score >= 60
    ? "注意"
    : "不良";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export default function PostureTimeline({ scoreHistory, duration }: PostureTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (scoreHistory.length < 2 || duration < 5) return null;

  // Compute proportions based on actual time spans
  const segments = scoreHistory.map((entry, i) => {
    const next = i < scoreHistory.length - 1 ? scoreHistory[i + 1] : null;
    const startTime = i === 0 ? entry.time - 30000 : entry.time;
    const endTime = next ? next.time : entry.time + 30000;
    const span = endTime - startTime;
    const totalSpan = scoreHistory[scoreHistory.length - 1].time - (scoreHistory[0].time - 30000) + 30000;
    return { ...entry, width: totalSpan > 0 ? (span / totalSpan) * 100 : 100 / scoreHistory.length };
  });

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-text-secondary">姿态时间线</p>
        {hoveredIndex !== null && segments[hoveredIndex] && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className={`inline-block w-2 h-2 rounded-full ${getScoreColor(segments[hoveredIndex].score)}`} />
            <span>{formatTime(segments[hoveredIndex].time)}</span>
            <span className="font-medium text-text-primary">{segments[hoveredIndex].score}分 · {getScoreLabel(segments[hoveredIndex].score)}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="flex h-4 rounded-full overflow-hidden gap-px">
          {segments.map((entry, i) => (
            <div
              key={entry.time}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                hoveredIndex === i ? "ring-2 ring-white/80 ring-offset-1 scale-y-125 origin-center" : ""
              } ${getScoreColor(entry.score)}`}
              style={{ width: `${entry.width}%`, minWidth: 4 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={`${formatTime(entry.time)} · ${entry.score}分 · ${getScoreLabel(entry.score)}`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>{formatTime(segments[0].time - 30000)}</span>
        <span>{formatTime(segments[segments.length - 1].time + 30000)}</span>
      </div>
    </div>
  );
}
