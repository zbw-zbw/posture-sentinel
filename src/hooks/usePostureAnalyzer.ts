"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PostureMetrics, PostureStatus } from "@/lib/posture";
import type { Settings } from "./useSettings";

interface SessionStats {
  totalDuration: number;
  goodDuration: number;
  warningDuration: number;
  badDuration: number;
  alertCount: number;
  avgScore: number;
  scoreHistory: { time: number; score: number }[];
}

interface PostureAnalyzerState {
  currentStatus: PostureStatus;
  statusDuration: number;
  badPostureStart: number | null;
  shouldAlert: boolean;
  alertMessage: string;
  sessionStats: SessionStats;
}

const ALERT_MESSAGES = [
  "你已经驼背 {duration} 了，试试挺直腰背深呼吸？",
  "注意坐姿！站起来伸展一下吧，你的脊椎会感谢你",
  "检测到持续前倾，试试把屏幕调高一点？",
  "你的肩膀不太对称哦，放松双肩，自然下垂",
  "已经驼背一会儿了，深吸一口气，把背挺直！",
];

export function usePostureAnalyzer(settings: Settings) {
  const [state, setState] = useState<PostureAnalyzerState>({
    currentStatus: "good",
    statusDuration: 0,
    badPostureStart: null,
    shouldAlert: false,
    alertMessage: "",
    sessionStats: {
      totalDuration: 0,
      goodDuration: 0,
      warningDuration: 0,
      badDuration: 0,
      alertCount: 0,
      avgScore: 0,
      scoreHistory: [],
    },
  });

  const [isRunning, setIsRunning] = useState(false);

  const currentStatusRef = useRef<PostureStatus>("good");
  const statusDurationRef = useRef<number>(0);
  const pendingStatusRef = useRef<PostureStatus | null>(null);
  const pendingDurationRef = useRef<number>(0);
  const badPostureStartRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const scoreAccumRef = useRef<number>(0);
  const scoreCountRef = useRef<number>(0);
  const lastScoreRecordRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const goodDurationRef = useRef<number>(0);
  const warningDurationRef = useRef<number>(0);
  const badDurationRef = useRef<number>(0);
  const alertCountRef = useRef<number>(0);
  const metricsRef = useRef<PostureMetrics | null>(null);
  const scoreHistoryRef = useRef<{ time: number; score: number }[]>([]);

  // 1-second tick for duration tracking
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      const isDetected = metrics?.isDetected ?? false;

      let shouldAlert = false;
      let alertMessage = "";
      const now = Date.now();

      if (isDetected && metrics) {
        // Update pending status duration
        if (pendingStatusRef.current) {
          pendingDurationRef.current += 1;
          const pending = pendingStatusRef.current;
          const dur = pendingDurationRef.current;

          // Check debounce thresholds
          const threshold = pending === "good" ? settings.statusDebounce.good
            : pending === "warning" ? settings.statusDebounce.warning
            : settings.statusDebounce.bad;

          if (dur >= threshold) {
            currentStatusRef.current = pending;
            statusDurationRef.current = 0;
            pendingStatusRef.current = null;
            pendingDurationRef.current = 0;
          }
        } else {
          statusDurationRef.current += 1;
        }

        const status = currentStatusRef.current;
        totalDurationRef.current += 1;

        if (status === "good") goodDurationRef.current += 1;
        else if (status === "warning") warningDurationRef.current += 1;
        else badDurationRef.current += 1;

        scoreAccumRef.current += metrics.overallScore;
        scoreCountRef.current += 1;

        // Record score every 30 seconds
        if (now - lastScoreRecordRef.current >= 30000) {
          lastScoreRecordRef.current = now;
          const intervalAvgScore = scoreCountRef.current > 0
            ? Math.round(scoreAccumRef.current / scoreCountRef.current)
            : 0;
          const newHistory = [...scoreHistoryRef.current, { time: now, score: intervalAvgScore }];
          scoreHistoryRef.current = newHistory;
          setState((prev) => ({
            ...prev,
            sessionStats: { ...prev.sessionStats, scoreHistory: newHistory },
          }));
        }

        // Track bad posture start
        if (status === "bad" && badPostureStartRef.current === null) {
          badPostureStartRef.current = now;
        } else if (status !== "bad") {
          badPostureStartRef.current = null;
        }

        // Check if should alert
        if (status === "bad" && badPostureStartRef.current !== null) {
          const badDuration = Math.floor((now - badPostureStartRef.current) / 1000);
          if (
            badDuration >= settings.badPostureThreshold &&
            now - lastAlertTimeRef.current >= settings.alertCooldown * 1000
          ) {
            shouldAlert = true;
            lastAlertTimeRef.current = now;
            alertCountRef.current += 1;
            const msg = ALERT_MESSAGES[Math.floor(Math.random() * ALERT_MESSAGES.length)];
            alertMessage = msg.replace("{duration}", `${badDuration}秒`);
          }
        }
      } else {
        // No person detected: cancel pending transitions and do not count duration
        pendingStatusRef.current = null;
        pendingDurationRef.current = 0;
        badPostureStartRef.current = null;
      }

      const avgScore = scoreCountRef.current > 0
        ? Math.round(scoreAccumRef.current / scoreCountRef.current)
        : 0;

      setState({
        currentStatus: currentStatusRef.current,
        statusDuration: statusDurationRef.current,
        badPostureStart: badPostureStartRef.current,
        shouldAlert,
        alertMessage,
        sessionStats: {
          totalDuration: totalDurationRef.current,
          goodDuration: goodDurationRef.current,
          warningDuration: warningDurationRef.current,
          badDuration: badDurationRef.current,
          alertCount: alertCountRef.current,
          avgScore,
          scoreHistory: scoreHistoryRef.current,
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, settings]);

  const updateMetrics = useCallback((metrics: PostureMetrics) => {
    metricsRef.current = metrics;

    // Determine target status from metrics
    const targetStatus: PostureStatus = metrics.status;

    if (targetStatus !== currentStatusRef.current && targetStatus !== pendingStatusRef.current) {
      pendingStatusRef.current = targetStatus;
      pendingDurationRef.current = 0;
    } else if (targetStatus === currentStatusRef.current && pendingStatusRef.current) {
      // Reverted back, cancel pending
      pendingStatusRef.current = null;
      pendingDurationRef.current = 0;
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    currentStatusRef.current = "good";
    statusDurationRef.current = 0;
    pendingStatusRef.current = null;
    pendingDurationRef.current = 0;
    badPostureStartRef.current = null;
    lastAlertTimeRef.current = 0;
    scoreAccumRef.current = 0;
    scoreCountRef.current = 0;
    lastScoreRecordRef.current = Date.now();
    scoreHistoryRef.current = [];
    totalDurationRef.current = 0;
    goodDurationRef.current = 0;
    warningDurationRef.current = 0;
    badDurationRef.current = 0;
    alertCountRef.current = 0;
    metricsRef.current = null;
    setState({
      currentStatus: "good",
      statusDuration: 0,
      badPostureStart: null,
      shouldAlert: false,
      alertMessage: "",
      sessionStats: {
        totalDuration: 0,
        goodDuration: 0,
        warningDuration: 0,
        badDuration: 0,
        alertCount: 0,
        avgScore: 0,
        scoreHistory: [],
      },
    });
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    start();
  }, [start]);

  const finalize = useCallback(() => {
    const total = totalDurationRef.current;
    const avgScore = scoreCountRef.current > 0
      ? Math.round(scoreAccumRef.current / scoreCountRef.current)
      : 0;
    return {
      totalDuration: total,
      goodDuration: goodDurationRef.current,
      warningDuration: warningDurationRef.current,
      badDuration: badDurationRef.current,
      alertCount: alertCountRef.current,
      avgScore,
      scoreHistory: scoreHistoryRef.current.length > 0
        ? scoreHistoryRef.current
        : avgScore > 0
          ? [{ time: Date.now(), score: avgScore }]
          : [],
    };
  }, []);

  return {
    ...state,
    updateMetrics,
    start,
    pause,
    resume,
    reset,
    finalize,
  };
}
