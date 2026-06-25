"use client";

interface MetricsSummaryProps {
  headAngle: number;
  shoulderSymmetry: number;
  spineAngle: number;
  alertCount: number;
  yesterdayMetrics?: {
    headAngle?: number;
    shoulderSymmetry?: number;
    spineAngle?: number;
    alertCount?: number;
  };
}

function MetricCard({ icon, name, value, unit, change }: { icon: string; name: string; value: number; unit: string; change?: number }) {
  const color = change === undefined ? "" : change > 0 ? "text-primary" : change < 0 ? "text-danger" : "text-text-muted";
  const arrow = change === undefined ? "" : change > 0 ? "↑" : change < 0 ? "↓" : "→";
  
  return (
    <div className="bg-surface-alt rounded-xl p-3 md:p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs">
        <span>{icon}</span>
        <span>{name}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary mt-2">
        {value}<span className="text-sm font-normal text-text-muted ml-1">{unit}</span>
      </p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${color}`}>
          {arrow} 较昨日 {change > 0 ? "+" : ""}{change}{unit}
        </p>
      )}
    </div>
  );
}

export default function MetricsSummary({ headAngle, shoulderSymmetry, spineAngle, alertCount, yesterdayMetrics }: MetricsSummaryProps) {
  const ym = yesterdayMetrics || {};
  
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      <MetricCard icon="🙇" name="平均头前倾" value={headAngle} unit="°" change={ym.headAngle !== undefined ? headAngle - ym.headAngle : undefined} />
      <MetricCard icon="🤷" name="肩膀对称度" value={shoulderSymmetry} unit="%" change={ym.shoulderSymmetry !== undefined ? shoulderSymmetry - ym.shoulderSymmetry : undefined} />
      <MetricCard icon="🦴" name="平均脊椎弧度" value={spineAngle} unit="°" change={ym.spineAngle !== undefined ? spineAngle - ym.spineAngle : undefined} />
      <MetricCard icon="🔔" name="提醒次数" value={alertCount} unit="次" change={ym.alertCount !== undefined ? alertCount - ym.alertCount : undefined} />
    </div>
  );
}
