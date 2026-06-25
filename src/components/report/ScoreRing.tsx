"use client";

import RingChart from "@/components/charts/RingChart";

interface ScoreRingProps {
  score: number;
  yesterdayScore?: number;
}

function ArrowIcon({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {up ? (
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
  );
}

export default function ScoreRing({ score, yesterdayScore }: ScoreRingProps) {
  const diff = yesterdayScore !== undefined ? score - yesterdayScore : undefined;
  
  return (
    <div className="flex flex-col items-center">
      <RingChart value={score} max={100} size={180} strokeWidth={12} animate={true} label={String(score)} sublabel="/100 分" />
      {diff !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${diff >= 0 ? "text-primary" : "text-danger"}`}>
          <ArrowIcon up={diff >= 0} />
          <span>较昨日 {diff >= 0 ? "+" : ""}{diff}分</span>
        </div>
      )}
    </div>
  );
}
