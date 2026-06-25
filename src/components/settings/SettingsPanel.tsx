"use client";

import { useState } from "react";
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const alertMethods = ["visual", "sound", "both"] as const;
  const alertMethodLabels: Record<string, string> = {
    visual: "视觉",
    sound: "声音",
    both: "视觉+声音",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Card 1: Detection Settings */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">🎯 检测设置</h3>

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
            帧率越高检测越流畅，但会增加CPU/GPU负载
          </p>
        </div>
      </div>

      {/* Card 2: Alert Settings */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">🔔 提醒设置</h3>

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
            className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl border border-border transition-all text-sm"
          >
            <span>🔊</span> 预览提醒效果
          </button>
        </div>
      </div>

      {/* Card 3: Advanced Settings (Collapsible) */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-bold text-text-primary">⚙️ 高级设置</h3>
          <span
            className={`text-text-muted transition-transform duration-200 ${
              isAdvancedOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isAdvancedOpen && (
          <div className="mt-5 space-y-4">
            {/* Head Angle Threshold */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">头前倾角度</span>
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
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">肩膀倾斜</span>
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
              <span className="text-sm text-text-secondary w-24 flex-shrink-0">脊椎角度</span>
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

            <p className="text-xs text-text-muted">
              调整各项角度阈值可自定义姿态判断标准，数值越小越严格
            </p>

            {/* Reset Defaults */}
            <div className="pt-2">
              <button
                onClick={onReset}
                className="text-sm text-danger hover:text-danger/80 font-medium transition-colors"
              >
                恢复默认设置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3">
        <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors">
          保存设置
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-3 rounded-xl border border-border transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
}
