"use client";

import { useState } from "react";

interface RestSettings {
  enabled: boolean;
  intervalMinutes: number;
  restDurationMinutes: number;
  showStretchGuide: boolean;
}

interface RestSettingsCardProps {
  settings: RestSettings;
  onUpdate: (updates: Partial<RestSettings>) => void;
}

const INTERVAL_OPTIONS = [15, 30, 45, 60];

/** Pill-style sliding toggle switch. */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function RestSettingsCard({
  settings,
  onUpdate,
}: RestSettingsCardProps) {
  const { enabled, intervalMinutes, restDurationMinutes, showStretchGuide } =
    settings;

  // Local reference so the dimmed section keeps its own transition without
  // fighting the parent re-render.
  const [restPreset] = useState(INTERVAL_OPTIONS);

  return (
    <div className="bg-surface rounded-2xl p-6 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
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
            <polyline points="12 6 12 12 16 14" />
          </svg>
          休息提醒
        </h3>
        <Toggle
          checked={enabled}
          onChange={() => onUpdate({ enabled: !enabled })}
          label={enabled ? "关闭休息提醒" : "开启休息提醒"}
        />
      </div>

      {/* Dimmable content */}
      <div
        className={`transition-opacity duration-200 ${
          enabled ? "opacity-100" : "opacity-40 pointer-events-none"
        }`}
      >
        {/* Description */}
        <p className="text-sm text-text-secondary mb-5">
          长时间久坐有害健康。开启后，检测期间会按设定间隔定时提醒你起身休息，
          帮助缓解肩颈疲劳、保护腰椎。
        </p>

        {/* Interval selector (4 buttons) */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">
            提醒间隔
          </label>
          <div className="flex gap-2">
            {restPreset.map((min) => (
              <button
                key={min}
                onClick={() => onUpdate({ intervalMinutes: min })}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  intervalMinutes === min
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-secondary hover:bg-border"
                }`}
              >
                {min} 分钟
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            每隔 {intervalMinutes} 分钟提醒你休息一次
          </p>
        </div>

        {/* Rest duration (range slider) */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">
            休息时长:{" "}
            <span className="text-text-primary font-medium">
              {restDurationMinutes} 分钟
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={restDurationMinutes}
            onChange={(e) =>
              onUpdate({ restDurationMinutes: Number(e.target.value) })
            }
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>1 分钟</span>
            <span>5 分钟</span>
          </div>
        </div>

        {/* Stretch guide toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text-primary font-medium">
              显示拉伸引导
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              休息时展示简单的拉伸动作示意
            </p>
          </div>
          <Toggle
            checked={showStretchGuide}
            onChange={() =>
              onUpdate({ showStretchGuide: !showStretchGuide })
            }
            label={showStretchGuide ? "关闭拉伸引导" : "开启拉伸引导"}
          />
        </div>
      </div>
    </div>
  );
}
