"use client";

import LineChart from "@/components/charts/LineChart";

interface PostureChartProps {
  scoreTimeline: { time: number; score: number }[];
}

export default function PostureChart({ scoreTimeline }: PostureChartProps) {
  if (!scoreTimeline || scoreTimeline.length < 2) {
    return (
      <div className="bg-surface-alt rounded-xl p-6 text-center">
        <p className="text-text-muted text-sm">评分变化数据不足（需要至少2个时间点）</p>
      </div>
    );
  }

  // Convert timestamps to time strings and build chart data
  const chartData = scoreTimeline.map((entry) => {
    const d = new Date(entry.time);
    const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    return { x: timeStr, y: entry.score };
  });

  return (
    <div>
      <LineChart
        data={chartData}
        height={200}
        color="#10b981"
        showArea={true}
        showGrid={true}
        yMax={100}
        yTicks={[0, 25, 50, 75, 100]}
        thresholdLines={[
          { value: 80, color: "#10b981", label: "良好" },
          { value: 60, color: "#f59e0b", label: "注意" },
        ]}
      />
    </div>
  );
}
