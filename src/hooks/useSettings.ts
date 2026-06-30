"use client";

import { useState, useCallback, useEffect } from "react";
import { saveSettings, loadSettings } from "@/lib/storage";

export interface Settings {
  version: number;
  sensitivity: "low" | "medium" | "high";
  badPostureThreshold: number;
  detectionFps: number;
  alertMethod: "visual" | "sound" | "both";
  alertVolume: number;
  alertCooldown: number;
  statusDebounce: { good: number; warning: number; bad: number };
  headAngleThreshold: { warning: number; bad: number };
  shoulderThreshold: { warning: number; bad: number };
  spineAngleThreshold: { warning: number; bad: number };
  dailyGoalMinutes: number; // 每日检测目标时长（分钟）
}

const SETTINGS_VERSION = 2;

const DEFAULT_SETTINGS: Settings = {
  version: SETTINGS_VERSION,
  sensitivity: "medium",
  badPostureThreshold: 30,
  detectionFps: 15,
  alertMethod: "visual",
  alertVolume: 50,
  alertCooldown: 60,
  statusDebounce: { good: 2, warning: 3, bad: 2 },
  headAngleThreshold: { warning: 5, bad: 15 },
  shoulderThreshold: { warning: 3, bad: 8 },
  spineAngleThreshold: { warning: 5, bad: 15 },
  dailyGoalMinutes: 30,
};

const SENSITIVITY_PRESETS: Record<string, Partial<Settings>> = {
  low: {
    // 低灵敏度：更宽松，需要更明显的偏移才判定为不良
    badPostureThreshold: 60,
    statusDebounce: { good: 4, warning: 5, bad: 4 },
    headAngleThreshold: { warning: 10, bad: 20 },
    shoulderThreshold: { warning: 6, bad: 12 },
    spineAngleThreshold: { warning: 10, bad: 20 },
  },
  medium: DEFAULT_SETTINGS,
  high: {
    // 高灵敏度：更严格，轻微偏移即判定
    badPostureThreshold: 15,
    statusDebounce: { good: 1, warning: 2, bad: 1 },
    headAngleThreshold: { warning: 3, bad: 8 },
    shoulderThreshold: { warning: 2, bad: 5 },
    spineAngleThreshold: { warning: 3, bad: 8 },
  },
};

// Migrate old settings whose threshold values had different semantics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSettings(saved: any): Settings {
  const isOldVersion = !saved || saved.version !== SETTINGS_VERSION;
  if (isOldVersion) {
    // Preserve safe user preferences, reset thresholds/debounce to new defaults
    return {
      ...DEFAULT_SETTINGS,
      sensitivity: saved?.sensitivity ?? DEFAULT_SETTINGS.sensitivity,
      badPostureThreshold: saved?.badPostureThreshold ?? DEFAULT_SETTINGS.badPostureThreshold,
      detectionFps: saved?.detectionFps ?? DEFAULT_SETTINGS.detectionFps,
      alertMethod: saved?.alertMethod ?? DEFAULT_SETTINGS.alertMethod,
      alertVolume: saved?.alertVolume ?? DEFAULT_SETTINGS.alertVolume,
      alertCooldown: saved?.alertCooldown ?? DEFAULT_SETTINGS.alertCooldown,
    };
  }
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadSettings<Settings>(DEFAULT_SETTINGS);
    const migrated = migrateSettings(saved);
    // Save back the migrated settings so next load is fast
    if ((saved as Settings | undefined)?.version !== SETTINGS_VERSION) {
      saveSettings(migrated);
    }
    const t = setTimeout(() => {
      setSettingsState(migrated);
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates, version: SETTINGS_VERSION };
      saveSettings(next);
      return next;
    });
  }, []);

  const setSensitivity = useCallback((level: "low" | "medium" | "high") => {
    const preset = SENSITIVITY_PRESETS[level];
    setSettingsState((prev) => {
      const next = {
        ...prev,
        version: SETTINGS_VERSION,
        sensitivity: level,
        ...preset,
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    setSensitivity,
    resetSettings,
  };
}
