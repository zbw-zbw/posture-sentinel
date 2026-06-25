"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAlertSystem } from "@/hooks/useAlertSystem";
import { initAudio } from "@/lib/sound";
import { clearAllSessions } from "@/lib/storage";
import SettingsPanel from "@/components/settings/SettingsPanel";
import AlertNotification from "@/components/detect/AlertNotification";
import PrivacyModal from "@/components/PrivacyModal";

export default function SettingsPage() {
  const { settings, isLoaded, updateSettings, setSensitivity, resetSettings } = useSettings();
  const { isAlertVisible, alertMessage, alertType, showAlert, dismissAlert } = useAlertSystem(
    settings.alertMethod,
    settings.alertVolume
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handlePreviewAlert = () => {
    initAudio();
    showAlert(
      "🙆 这是一条提醒预览，实际检测时会根据你的坐姿状态触发提醒。",
      "warning"
    );
  };

  const handleClearData = () => {
    clearAllSessions();
    setShowClearConfirm(false);
    showAlert("✅ 所有本地数据已清除", "warning");
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
        />

        {/* Danger Zone */}
        <div className="mt-8 bg-surface rounded-2xl border border-danger/20 p-6">
          <h3 className="text-base font-semibold text-danger mb-4">⚠️ 危险区域</h3>
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
                🗑️ 清除所有数据
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

        {/* Privacy link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setPrivacyOpen(true)}
            className="text-sm text-text-muted hover:text-text-secondary underline transition-colors"
          >
            隐私与数据安全说明
          </button>
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

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}