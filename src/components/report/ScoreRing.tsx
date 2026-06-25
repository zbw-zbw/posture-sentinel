"use client";

import RingChart from "@/components/charts/RingChart";

interface ScoreRingProps {
  score: number;
  yesterdayScore?: number;
}

export default function ScoreRing({ score, yesterdayScore }: ScoreRingProps) {
  const diff = yesterdayScore !== undefined ? score - yesterdayScore : undefined;
  
  return (
    <div className="flex flex-col items-center">
      <RingChart value={score} max={100} size={180} strokeWidth={12} animate={true} label={String(score)} sublabel="/100 分" />
      {diff !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${diff >= 0 ? "text-primary" : "text-danger"}`}>
          <span>{diff >= 0 ? "↑" : "↓"}</span>
          <span>较昨日 {diff >= 0 ? "+" : ""}{diff}分</span>
        </div>
      )}
    </div>
  );
}
