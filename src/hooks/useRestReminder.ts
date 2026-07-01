"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRestSettings, saveRestSettings, type RestReminderSettings } from "@/lib/storage";

export type RestPhase = "idle" | "counting" | "triggered" | "resting" | "snoozed";

export interface RestReminderState {
  phase: RestPhase;
  /** Seconds elapsed since detection started (excluding paused time) */
  elapsedSinceLastRest: number;
  /** Seconds remaining in rest countdown */
  restRemaining: number;
  /** Progress 0-1 toward next rest trigger */
  progress: number;
}

export function useRestReminder(isDetecting: boolean, isPaused: boolean) {
  const [settings, setSettings] = useState<RestReminderSettings>(() => getRestSettings());
  const [phase, setPhase] = useState<RestPhase>("idle");
  const [elapsedSinceLastRest, setElapsedSinceLastRest] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update settings from storage on mount
  useEffect(() => {
    setSettings(getRestSettings());
  }, []);

  const updateSettings = useCallback((updates: Partial<RestReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveRestSettings(next);
      return next;
    });
  }, []);

  // Reset when detection stops
  useEffect(() => {
    if (!isDetecting && phase !== "resting") {
      setPhase("idle");
      setElapsedSinceLastRest(0);
      setRestRemaining(0);
    }
    if (isDetecting && phase === "idle") {
      setPhase("counting");
    }
  }, [isDetecting, phase]);

  // Main timer loop
  useEffect(() => {
    if (!settings.enabled) return;
    if (phase === "idle") return;

    // Pause counting when detection is paused (but not during resting)
    if (isPaused && phase === "counting") return;

    intervalRef.current = setInterval(() => {
      if (phase === "counting") {
        setElapsedSinceLastRest((prev) => {
          const next = prev + 1;
          const threshold = settings.intervalMinutes * 60;
          if (next >= threshold) {
            // Go to "triggered" first - user decides whether to rest
            setPhase("triggered");
            return 0;
          }
          return next;
        });
      } else if (phase === "resting") {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            setPhase("counting");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.enabled, settings.intervalMinutes, settings.restDurationMinutes, phase, isPaused]);

  const startRestNow = useCallback(() => {
    setPhase("resting");
    setRestRemaining(settings.restDurationMinutes * 60);
    setElapsedSinceLastRest(0);
  }, [settings.restDurationMinutes]);

  const snooze = useCallback(() => {
    setPhase("snoozed");
    setElapsedSinceLastRest(0);
    // After 5 minutes, go back to counting
    setTimeout(() => {
      setPhase("counting");
    }, 5 * 60 * 1000);
  }, []);

  const skipRest = useCallback(() => {
    setPhase("counting");
    setRestRemaining(0);
    setElapsedSinceLastRest(0);
  }, []);

  const dismissSnooze = useCallback(() => {
    setPhase("counting");
  }, []);

  const intervalSec = settings.intervalMinutes * 60;
  const progress = phase === "counting" && intervalSec > 0
    ? Math.min(1, elapsedSinceLastRest / intervalSec)
    : 0;

  return {
    settings,
    updateSettings,
    phase,
    elapsedSinceLastRest,
    restRemaining,
    progress,
    startRestNow,
    snooze,
    skipRest,
    dismissSnooze,
    /** True when the rest countdown just triggered (phase === resting and restRemaining === full duration) */
    isRestJustTriggered: phase === "resting" && restRemaining === settings.restDurationMinutes * 60,
  };
}
