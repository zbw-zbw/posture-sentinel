"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type PomodoroPhase = "idle" | "focusing" | "break" | "paused";

interface UsePomodoroOptions {
  focusMinutes?: number;
  breakMinutes?: number;
  onPhaseChange?: (phase: PomodoroPhase) => void;
}

interface PomodoroState {
  phase: PomodoroPhase;
  remaining: number; // seconds
  completedFocus: number; // count
  isRunning: boolean;
}

export function usePomodoro({
  focusMinutes = 25,
  breakMinutes = 5,
  onPhaseChange,
}: UsePomodoroOptions = {}) {
  const [state, setState] = useState<PomodoroState>({
    phase: "idle",
    remaining: focusMinutes * 60,
    completedFocus: 0,
    isRunning: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<PomodoroPhase>("idle");
  // Track the phase before pausing so resume() can restore it correctly
  const pausedFromPhaseRef = useRef<PomodoroPhase>("focusing");
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setPhase = useCallback((newPhase: PomodoroPhase, remaining?: number) => {
    phaseRef.current = newPhase;
    setState(prev => ({
      phase: newPhase,
      remaining: remaining ?? prev.remaining,
      completedFocus: prev.completedFocus,
      isRunning: newPhase === "focusing" || newPhase === "break",
    }));
    onPhaseChangeRef.current?.(newPhase);
  }, []);

  const transitionTo = useCallback((newPhase: PomodoroPhase) => {
    phaseRef.current = newPhase;
    const durations: Record<string, number> = {
      focusing: focusMinutes * 60,
      break: breakMinutes * 60,
      idle: focusMinutes * 60,
    };
    setState(prev => {
      const completedFocus = newPhase === "idle" && (prev.phase === "focusing" || prev.phase === "paused")
        ? prev.completedFocus + (pausedFromPhaseRef.current === "focusing" ? 0 : 0)
        : prev.completedFocus;
      return {
        phase: newPhase,
        remaining: durations[newPhase] ?? prev.remaining,
        completedFocus,
        isRunning: newPhase === "focusing" || newPhase === "break",
      };
    });
    onPhaseChangeRef.current?.(newPhase);
  }, [focusMinutes, breakMinutes]);

  // Tick
  useEffect(() => {
    if (!state.isRunning) return;

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.remaining <= 1) {
          // Phase complete — auto-transition
          const nextPhase = prev.phase === "focusing" ? "break" : "focusing";
          const nextDuration = nextPhase === "focusing" ? focusMinutes * 60 : breakMinutes * 60;
          phaseRef.current = nextPhase;
          onPhaseChangeRef.current?.(nextPhase);
          return {
            ...prev,
            phase: nextPhase,
            remaining: nextDuration,
            completedFocus: prev.phase === "focusing" ? prev.completedFocus + 1 : prev.completedFocus,
          };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [state.isRunning, focusMinutes, breakMinutes, clearTimer]);

  const start = useCallback(() => transitionTo("focusing"), [transitionTo]);

  const pause = useCallback(() => {
    // Save current phase so resume() can restore it correctly
    pausedFromPhaseRef.current = phaseRef.current === "paused" ? pausedFromPhaseRef.current : phaseRef.current;
    setPhase("paused");
  }, [setPhase]);

  const resume = useCallback(() => {
    // Restore the phase that was active before pausing
    const restoredPhase = pausedFromPhaseRef.current === "break" ? "break" : "focusing";
    setPhase(restoredPhase);
  }, [setPhase]);

  const skip = useCallback(() => {
    const current = phaseRef.current === "paused" ? pausedFromPhaseRef.current : phaseRef.current;
    transitionTo(current === "focusing" ? "break" : "focusing");
  }, [transitionTo]);

  const stop = useCallback(() => {
    clearTimer();
    setState({ phase: "idle", remaining: focusMinutes * 60, completedFocus: 0, isRunning: false });
    phaseRef.current = "idle";
    onPhaseChangeRef.current?.("idle");
  }, [clearTimer, focusMinutes]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { ...state, start, pause, resume, skip, stop };
}
