"use client";

interface PostureBaseline {
  headTilt: number;
  shoulderTilt: number;
  neckForward: number;
  spineTilt: number;
  capturedAt: number;
}

interface BaselineCardProps {
  baseline: PostureBaseline | null;
  onRecalibrate: () => void;
  onClear: () => void;
}

/** Format a timestamp as "YYYY-MM-DD HH:MM" using local time. */
function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

interface MetricConfig {
  key: keyof Pick<PostureBaseline, "headTilt" | "shoulderTilt" | "neckForward" | "spineTilt">;
  label: string;
  unit: string;
}

const METRICS: MetricConfig[] = [
  { key: "headTilt", label: "头部倾斜", unit: "°" },
  { key: "shoulderTilt", label: "肩膀倾斜", unit: "°" },
  { key: "neckForward", label: "颈部前倾", unit: "°" },
  { key: "spineTilt", label: "脊椎倾斜", unit: "°" },
];

export default function BaselineCard({
  baseline,
  onRecalibrate,
  onClear,
}: BaselineCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 card-hover">
      {/* Header */}
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        个人校准
      </h3>

      {baseline ? (
        <>
          {/* Baseline metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {METRICS.map((m) => (
              <div
                key={m.key}
                className="bg-surface-alt rounded-xl p-3 text-center"
              >
                <p className="text-xs text-text-muted mb-1">{m.label}</p>
                <p className="text-lg font-bold text-text-primary">
                  {baseline[m.key].toFixed(1)}
                  <span className="text-sm font-normal text-text-secondary ml-0.5">
                    {m.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Captured time */}
          <div className="flex items-center gap-2 mb-5">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-text-muted flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-xs text-text-secondary">
              校准时间:{" "}
              <span className="text-text-primary font-medium">
                {formatDateTime(baseline.capturedAt)}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onRecalibrate}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              重新校准
            </button>
            <button
              onClick={onClear}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-danger-light text-danger border border-danger/30 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              清除基线
            </button>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-alt mb-3">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            尚未校准
          </p>
          <p className="text-xs text-text-muted mb-4 max-w-xs mx-auto leading-relaxed">
            校准后，检测将基于你的个人标准姿态，更精准地识别偏差
          </p>
          <button
            onClick={onRecalibrate}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            开始校准
          </button>
        </div>
      )}
    </div>
  );
}
