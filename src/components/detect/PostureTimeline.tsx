"use client";

import { useState, useCallback, memo } from "react";

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

function PostureTimelineImpl({ scoreHistory, duration }: PostureTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSegmentClick = useCallback((i: number) => {
    setHoveredIndex(prev => prev === i ? null : i);
  }, []);

  if (scoreHistory.length < 2 || duration < 5) {
    return (
      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-2">姿态时间线</p>
        <div className="h-4 rounded-full bg-surface-alt flex items-center justify-center">
          <span className="text-xs text-text-muted">检测 5 秒后显示时间线</span>
        </div>
      </div>
    );
  }

  // 5s padding (less aggressive than 30s) so short sessions don't get
  // misleading time labels that extend far beyond the actual data span.
  const PADDING = 5000;
  // Compute proportions based on actual time spans
  const segments = scoreHistory.map((entry, i) => {
    const next = i < scoreHistory.length - 1 ? scoreHistory[i + 1] : null;
    const startTime = i === 0 ? entry.time - PADDING : entry.time;
    const endTime = next ? next.time : entry.time + PADDING;
    const span = endTime - startTime;
    const totalSpan = scoreHistory[scoreHistory.length - 1].time - (scoreHistory[0].time - PADDING) + PADDING;
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
              role="button"
              tabIndex={0}
              aria-label={`${formatTime(entry.time)} 评分 ${entry.score} 分 ${getScoreLabel(entry.score)}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                hoveredIndex === i ? "ring-2 ring-white/80 ring-offset-1 scale-y-125 origin-center" : ""
              } ${getScoreColor(entry.score)}`}
              style={{ width: `${entry.width}%`, minWidth: 4 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleSegmentClick(i)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span>{formatTime(segments[0].time - PADDING)}</span>
        <span>{formatTime(segments[segments.length - 1].time + PADDING)}</span>
      </div>
      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />良好
        </span>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-warning" />注意
        </span>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-danger" />不良
        </span>
      </div>
    </div>
  );
}

const PostureTimeline = memo(PostureTimelineImpl);
export default PostureTimeline;
