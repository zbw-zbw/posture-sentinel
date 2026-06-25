"use client";

interface DistributionBarProps {
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  totalDuration: number; // minutes
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分钟`;
  return `${h}小时${m}分`;
}

export default function DistributionBar({ goodPercent, warningPercent, badPercent, totalDuration }: DistributionBarProps) {
  const items = [
    { label: "良好坐姿", percent: goodPercent, color: "bg-primary", dot: "bg-primary" },
    { label: "需要注意", percent: warningPercent, color: "bg-warning", dot: "bg-warning" },
    { label: "坐姿不良", percent: badPercent, color: "bg-danger", dot: "bg-danger" },
  ];
  
  return (
    <div>
      {/* Bar */}
      <div className="flex h-5 rounded-full overflow-hidden">
        {goodPercent > 0 && <div className="bg-primary" style={{ width: `${goodPercent}%` }} />}
        {warningPercent > 0 && <div className="bg-warning" style={{ width: `${warningPercent}%` }} />}
        {badPercent > 0 && <div className="bg-danger" style={{ width: `${badPercent}%` }} />}
      </div>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const itemMinutes = Math.round((item.percent / 100) * totalDuration);
          return (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                <span className="text-text-secondary">{item.label}</span>
              </div>
              <span className="text-text-primary font-medium">{item.percent}%（{formatDuration(itemMinutes)}）</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
