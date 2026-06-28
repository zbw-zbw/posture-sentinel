"use client";

interface MetricsSummaryProps {
  headTilt: number;
  shoulderTilt: number;
  neckForward: number;
  spineTilt: number;
  alertCount: number;
  yesterdayMetrics?: {
    headTilt?: number;
    shoulderTilt?: number;
    neckForward?: number;
    spineTilt?: number;
    alertCount?: number;
  };
}

function ChangeArrow({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return (
      <svg viewBox="0 0 24 24" className="w-3 h-3 inline-block -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg viewBox="0 0 24 24" className="w-3 h-3 inline-block -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 inline-block -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function MetricCard({ icon, name, value, unit, threshold, change }: { icon: React.ReactNode; name: string; value: number; unit: string; threshold?: string; change?: number }) {
  const color = change === undefined ? "" : change > 0 ? "text-primary" : change < 0 ? "text-danger" : "text-text-muted";
  const direction = change === undefined ? "neutral" : change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return (
    <div className="bg-surface-alt rounded-xl p-3 md:p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs">
        <span className="flex-shrink-0">{icon}</span>
        <span>{name}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary mt-2">
        {value}<span className="text-sm font-normal text-text-muted ml-1">{unit}</span>
      </p>
      {threshold && (
        <p className="text-xs text-text-muted mt-1">{threshold}</p>
      )}
      {change !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${color}`}>
          <ChangeArrow direction={direction} />
          较昨日 {change > 0 ? "+" : ""}{change}{unit}
        </p>
      )}
    </div>
  );
}

export default function MetricsSummary({ headTilt, shoulderTilt, neckForward, spineTilt, alertCount, yesterdayMetrics }: MetricsSummaryProps) {
  const ym = yesterdayMetrics || {};

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      <MetricCard icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      } name="头部倾斜" value={headTilt} unit="°" threshold="正常 < 5°" change={ym.headTilt !== undefined ? headTilt - ym.headTilt : undefined} />
      <MetricCard icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      } name="肩膀倾斜" value={shoulderTilt} unit="°" threshold="正常 < 3°" change={ym.shoulderTilt !== undefined ? shoulderTilt - ym.shoulderTilt : undefined} />
      <MetricCard icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22" />
          <path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      } name="脊椎倾斜" value={spineTilt} unit="°" threshold="正常 < 5°" change={ym.spineTilt !== undefined ? spineTilt - ym.spineTilt : undefined} />
      <MetricCard icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      } name="脖子前倾" value={neckForward} unit="%" threshold="正常 < 30%" change={ym.neckForward !== undefined ? neckForward - ym.neckForward : undefined} />
      <MetricCard icon={
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      } name="提醒次数" value={alertCount} unit="次" change={ym.alertCount !== undefined ? alertCount - ym.alertCount : undefined} />
    </div>
  );
}
