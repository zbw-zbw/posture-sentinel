"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAlertSystem } from "@/hooks/useAlertSystem";
import { initAudio } from "@/lib/sound";
import { clearAllSessions } from "@/lib/storage";
import SettingsPanel from "@/components/settings/SettingsPanel";
import AlertNotification from "@/components/detect/AlertNotification";

export default function SettingsPage() {
  const { settings, isLoaded, updateSettings, setSensitivity, resetSettings } = useSettings();
  const { isAlertVisible, alertMessage, alertType, showAlert, dismissAlert } = useAlertSystem(
    settings.alertMethod,
    settings.alertVolume
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handlePreviewAlert = () => {
    initAudio();
    showAlert(
      "这是一条提醒预览，实际检测时会根据你的坐姿状态触发提醒。",
      "warning"
    );
  };

  const handleSave = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleClearData = () => {
    clearAllSessions();
    setShowClearConfirm(false);
    showAlert("所有本地数据已清除", "warning");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[700px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            设置
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            自定义检测灵敏度、提醒方式和阈值参数
          </p>
        </div>

        {/* Settings Panel */}
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onSetSensitivity={setSensitivity}
          onReset={resetSettings}
          onPreviewAlert={handlePreviewAlert}
          onSave={handleSave}
        />

        {/* Danger Zone */}
        <div className="mt-8 bg-surface rounded-2xl border border-danger/20 p-6 card-hover">
          <h3 className="text-base font-semibold text-danger mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            危险区域
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">清除所有本地数据</p>
              <p className="text-xs text-text-muted mt-1">此操作不可恢复，将删除所有检测记录和设置</p>
            </div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full sm:w-auto bg-danger-light hover:bg-danger/10 text-danger font-medium px-5 py-2.5 rounded-xl border border-danger/20 transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                清除所有数据
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleClearData}
                  className="flex-1 bg-danger hover:bg-danger/90 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
                >
                  确认清除
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl border border-border transition-colors text-sm"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Alert Preview */}
      <AlertNotification
        isVisible={isAlertVisible}
        message={alertMessage}
        type={alertType}
        alertCount={0}
        statusDuration={0}
        onDismiss={dismissAlert}
      />

      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="fixed bottom-5 left-0 right-0 z-[100] flex justify-center animate-slide-up">
          <div className="bg-primary text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            设置已保存
          </div>
        </div>
      )}

    </div>
  );
}