"use client";

import type { Settings } from "@/hooks/useSettings";

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onSetSensitivity: (level: "low" | "medium" | "high") => void;
  onReset: () => void;
  onPreviewAlert: () => void;
}

export default function SettingsPanel({
  settings,
  onUpdate,
  onSetSensitivity,
  onReset,
  onPreviewAlert,
}: SettingsPanelProps) {
  const alertMethods = ["visual", "sound", "both"] as const;
  const alertMethodLabels: Record<string, string> = {
    visual: "视觉",
    sound: "声音",
    both: "视觉+声音",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Auto-save hint */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        设置会自动保存到浏览器本地
      </div>

      {/* Card 1: Detection Settings */}
      <div className="bg-surface rounded-2xl p-6 mb-6 card-hover">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          检测设置
        </h3>

        {/* Sensitivity */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">灵敏度</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => onSetSensitivity(level)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  settings.sensitivity === level
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-secondary hover:bg-border"
                }`}
              >
                {level === "low"
                  ? "低灵敏度"
                  : level === "medium"
                    ? "中灵敏度"
                    : "高灵敏度"}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            灵敏度越高，对姿态变化的检测越敏感
          </p>
        </div>

        {/* Detection FPS */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            检测帧率: <span className="text-text-primary font-medium">{settings.detectionFps} FPS</span>
          </label>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={settings.detectionFps}
            onChange={(e) => onUpdate({ detectionFps: Number(e.target.value) })}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-text-muted mt-1.5">
            帧率越高检测越流畅，但会增加 CPU/GPU 负载
          </p>
        </div>

        {/* Daily Goal */}
        <div className="mt-5">
          <label className="block text-sm text-text-secondary mb-2">
            每日检测目标: <span className="text-text-primary font-medium">{settings.dailyGoalMinutes} 分钟</span>
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={settings.dailyGoalMinutes}
            onChange={(e) => onUpdate({ dailyGoalMinutes: Number(e.target.value) })}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>10 分钟</span>
            <span>120 分钟</span>
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            每日检测达到目标时长即为达标
          </p>
        </div>
      </div>

      {/* Card 2: Alert Settings */}
      <div className="bg-surface rounded-2xl p-6 mb-6 card-hover">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          提醒设置
        </h3>

        {/* Alert Method */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">提醒方式</label>
          <div className="flex gap-2">
            {alertMethods.map((method) => (
              <button
                key={method}
                onClick={() => onUpdate({ alertMethod: method })}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  settings.alertMethod === method
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-secondary hover:bg-border"
                }`}
              >
                {alertMethodLabels[method]}
              </button>
            ))}
          </div>
        </div>

        {/* Bad Posture Threshold */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">
            不良姿态触发阈值: <span className="text-text-primary font-medium">{settings.badPostureThreshold}秒</span>
          </label>
          <input
            type="range"
            min={3}
            max={60}
            step={1}
            value={settings.badPostureThreshold}
            onChange={(e) => onUpdate({ badPostureThreshold: Number(e.target.value) })}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-text-muted mt-1.5">
            持续不良姿态超过此时长后触发提醒
          </p>
        </div>

        {/* Cooldown */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">
            提醒冷却时间: <span className="text-text-primary font-medium">{settings.alertCooldown}秒</span>
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={settings.alertCooldown}
            onChange={(e) => onUpdate({ alertCooldown: Number(e.target.value) })}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-text-muted mt-1.5">
            两次提醒之间的最小间隔，避免频繁打扰
          </p>
        </div>

        {/* Volume */}
        <div className="mb-5">
          <label className="block text-sm text-text-secondary mb-2">
            提醒音量: <span className="text-text-primary font-medium">{settings.alertVolume}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.alertVolume}
            onChange={(e) => onUpdate({ alertVolume: Number(e.target.value) })}
            className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-text-muted mt-1.5">
            声音提醒的音量大小
          </p>
        </div>

        {/* Preview */}
        <div>
          <button
            onClick={onPreviewAlert}
            className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            预览提醒效果
          </button>
          <p className="text-xs text-text-muted mt-2">
            实际检测时，当坐姿持续不良超过 {settings.badPostureThreshold} 秒，屏幕底部会弹出提醒。
            {settings.alertMethod !== "visual" && " 同时会播放一次提示音（需浏览器允许自动播放）。"}
          </p>
        </div>
      </div>

      {/* Card 3: Advanced Settings (Collapsible) */}
      <div className="bg-surface rounded-2xl p-6 mb-6">
        <details className="group">
          <summary className="flex items-center justify-between w-full text-left list-none cursor-pointer">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              高级设置
            </h3>
            <span className="text-text-muted transition-transform duration-200 group-open:rotate-180">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </summary>

          <div className="mt-5 space-y-4">
            {/* Head Angle Threshold */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">头部倾斜</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.headAngleThreshold.warning}
                  onChange={(e) =>
                    onUpdate({
                      headAngleThreshold: {
                        ...settings.headAngleThreshold,
                        warning: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 注意</span>
                <input
                  type="number"
                  value={settings.headAngleThreshold.bad}
                  onChange={(e) =>
                    onUpdate({
                      headAngleThreshold: {
                        ...settings.headAngleThreshold,
                        bad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 不良</span>
              </div>
            </div>

            {/* Shoulder Threshold */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">肩膀倾斜</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.shoulderThreshold.warning}
                  onChange={(e) =>
                    onUpdate({
                      shoulderThreshold: {
                        ...settings.shoulderThreshold,
                        warning: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 注意</span>
                <input
                  type="number"
                  value={settings.shoulderThreshold.bad}
                  onChange={(e) =>
                    onUpdate({
                      shoulderThreshold: {
                        ...settings.shoulderThreshold,
                        bad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 不良</span>
              </div>
            </div>

            {/* Spine Angle Threshold */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">脊椎倾斜</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.spineAngleThreshold.warning}
                  onChange={(e) =>
                    onUpdate({
                      spineAngleThreshold: {
                        ...settings.spineAngleThreshold,
                        warning: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 注意</span>
                <input
                  type="number"
                  value={settings.spineAngleThreshold.bad}
                  onChange={(e) =>
                    onUpdate({
                      spineAngleThreshold: {
                        ...settings.spineAngleThreshold,
                        bad: Number(e.target.value),
                      },
                    })
                  }
                  className="w-16 px-2 py-1 border border-border rounded-lg text-center text-sm"
                />
                <span className="text-text-muted text-xs">° 不良</span>
              </div>
            </div>

            {/* Status Debounce */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                状态切换防抖
              </label>
              <p className="text-xs text-text-muted mb-3">
                避免姿态短暂波动导致状态频繁切换。数值越大状态越稳定。
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">坐姿良好</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.statusDebounce.good}
                    onChange={(e) =>
                      onUpdate({
                        statusDebounce: {
                          ...settings.statusDebounce,
                          good: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-text-primary text-sm font-medium w-10 text-right">{settings.statusDebounce.good}秒</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">需要注意</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.statusDebounce.warning}
                    onChange={(e) =>
                      onUpdate({
                        statusDebounce: {
                          ...settings.statusDebounce,
                          warning: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-text-primary text-sm font-medium w-10 text-right">{settings.statusDebounce.warning}秒</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-20 sm:w-24 flex-shrink-0">坐姿不良</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.statusDebounce.bad}
                    onChange={(e) =>
                      onUpdate({
                        statusDebounce: {
                          ...settings.statusDebounce,
                          bad: Number(e.target.value),
                        },
                      })
                    }
                    className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-text-primary text-sm font-medium w-10 text-right">{settings.statusDebounce.bad}秒</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted">
              调整各项角度阈值可自定义姿态判断标准，数值越小越严格
            </p>
          </div>
        </details>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 bg-surface-alt hover:bg-danger-light hover:text-danger text-text-secondary font-medium px-4 py-3 rounded-xl transition-all text-sm"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        恢复默认设置
      </button>
    </div>
  );
}
