"use client";

import { useSettings } from "@/hooks/useSettings";
import SettingsPanel from "@/components/settings/SettingsPanel";
import AlertNotification from "@/components/detect/AlertNotification";
import { playAlertSound, initAudio } from "@/lib/sound";
import { useState } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, setSensitivity, resetSettings } = useSettings();
  const [dangerOpen, setDangerOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("posture-sentinel:sessions");
      localStorage.removeItem("posture-sentinel:settings");
    }
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const handlePreviewAlert = () => {
    initAudio();
    setDangerOpen(true);
    if (settings.alertMethod !== "visual") {
      playAlertSound("bad", settings.alertVolume / 100);
    }
    setTimeout(() => setDangerOpen(false), 3000);
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-light/10 to-transparent px-4 md:px-6 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            设置
          </h1>
          <p className="text-sm md:text-base text-text-secondary">
            自定义检测灵敏度、提醒方式和高级阈值
          </p>
        </div>
      </section>

      {/* Settings Panel */}
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-3xl mx-auto">
          <SettingsPanel
            settings={settings}
            onUpdate={updateSettings}
            onSetSensitivity={setSensitivity}
            onReset={resetSettings}
            onPreviewAlert={handlePreviewAlert}
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl p-6 border border-danger/20">
            <h3 className="text-lg font-bold text-danger mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              危险操作
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              清除所有本地数据后无法恢复，包括历史检测记录和当前设置。
            </p>
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2 bg-danger-light hover:bg-danger/20 text-danger font-medium px-4 py-3 rounded-xl transition-all text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {cleared ? "已清除" : "清除所有本地数据"}
            </button>
          </div>
        </div>
      </section>

      {/* Preview */}
      <AlertNotification
        isVisible={dangerOpen}
        message="这是一条提醒预览。当坐姿持续不良时，屏幕底部会弹出类似提示。"
        type="bad"
        alertCount={1}
        statusDuration={settings.badPostureThreshold}
        onDismiss={() => setDangerOpen(false)}
      />
    </div>
  );
}
