"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface SessionSummaryData {
  duration: number;
  avgScore: number;
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  alertCount: number;
  scoreHistory: { time: number; score: number }[];
}

interface UseDetectSessionReturn {
  sessionState: "idle" | "running" | "paused" | "ended";
  elapsedTime: number;
  formattedTime: string;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (stats: {
    totalDuration: number;
    goodDuration: number;
    warningDuration: number;
    badDuration: number;
    alertCount: number;
    avgScore: number;
    scoreHistory: { time: number; score: number }[];
  }) => SessionSummaryData;
  getElapsedTime: () => number;
  summaryData: SessionSummaryData | null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function useDetectSession(): UseDetectSessionReturn {
  const [sessionState, setSessionState] = useState<"idle" | "running" | "paused" | "ended">("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);

  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(() => {
    startRef.current = Date.now();
    pausedAtRef.current = 0;
    setElapsedTime(0);
    setSessionState("running");
    setSummaryData(null);
  }, []);

  const pauseSession = useCallback(() => {
    pausedAtRef.current = Date.now();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSessionState("paused");
  }, []);

  const resumeSession = useCallback(() => {
    if (pausedAtRef.current > 0) {
      startRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
    }
    setSessionState("running");
  }, []);

  const getElapsedTime = useCallback(() => {
    if (sessionState === "idle") return 0;
    if (sessionState === "paused") {
      return pausedAtRef.current > 0 && startRef.current > 0
        ? Math.floor((pausedAtRef.current - startRef.current) / 1000)
        : elapsedTime;
    }
    return Math.floor((Date.now() - startRef.current) / 1000);
  }, [sessionState, elapsedTime]);

  const endSession = useCallback((stats: {
    totalDuration: number;
    goodDuration: number;
    warningDuration: number;
    badDuration: number;
    alertCount: number;
    avgScore: number;
    scoreHistory: { time: number; score: number }[];
  }): SessionSummaryData => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSessionState("ended");

    const total = stats.totalDuration > 0 ? stats.totalDuration : 1;
    const avgScore = stats.avgScore || 0;
    const summary: SessionSummaryData = {
      duration: stats.totalDuration,
      avgScore,
      goodPercent: Math.round((stats.goodDuration / total) * 100),
      warningPercent: Math.round((stats.warningDuration / total) * 100),
      badPercent: Math.round((stats.badDuration / total) * 100),
      alertCount: stats.alertCount,
      scoreHistory: stats.scoreHistory.length > 0 ? stats.scoreHistory : [
        { time: Date.now(), score: avgScore },
      ],
    };

    setSummaryData(summary);
    return summary;
  }, []);

  // Timer tick
  useEffect(() => {
    if (sessionState === "running") {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsedTime(Math.max(0, elapsed));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState]);

  return {
    sessionState,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    getElapsedTime,
    summaryData,
  };
}
