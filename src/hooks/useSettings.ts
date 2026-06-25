"use client";

import { useState, useCallback, useEffect } from "react";
import { saveSettings, loadSettings } from "@/lib/storage";

export interface Settings {
  sensitivity: "low" | "medium" | "high";
  badPostureThreshold: number;
  detectionFps: number;
  alertMethod: "visual" | "sound" | "both";
  alertVolume: number;
  alertCooldown: number;
  headAngleThreshold: { warning: number; bad: number };
  shoulderThreshold: { warning: number; bad: number };
  spineAngleThreshold: { warning: number; bad: number };
}

const DEFAULT_SETTINGS: Settings = {
  sensitivity: "medium",
  badPostureThreshold: 30,
  detectionFps: 15,
  alertMethod: "visual",
  alertVolume: 50,
  alertCooldown: 60,
  headAngleThreshold: { warning: 15, bad: 25 },
  shoulderThreshold: { warning: 85, bad: 70 },
  spineAngleThreshold: { warning: 20, bad: 35 },
};

const SENSITIVITY_PRESETS: Record<string, Partial<Settings>> = {
  low: {
    badPostureThreshold: 60,
    headAngleThreshold: { warning: 20, bad: 30 },
    shoulderThreshold: { warning: 75, bad: 60 },
    spineAngleThreshold: { warning: 30, bad: 45 },
  },
  medium: DEFAULT_SETTINGS,
  high: {
    badPostureThreshold: 15,
    headAngleThreshold: { warning: 10, bad: 20 },
    shoulderThreshold: { warning: 90, bad: 80 },
    spineAngleThreshold: { warning: 15, bad: 25 },
  },
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadSettings<Settings>(DEFAULT_SETTINGS);
    const t = setTimeout(() => {
      setSettingsState(saved);
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const setSensitivity = useCallback((level: "low" | "medium" | "high") => {
    const preset = SENSITIVITY_PRESETS[level];
    setSettingsState((prev) => {
      const next = {
        ...prev,
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
