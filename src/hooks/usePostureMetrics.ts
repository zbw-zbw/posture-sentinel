"use client";

import { useMemo } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { analyzePosture, DEFAULT_POSTURE_THRESHOLDS, type PostureMetrics, type PostureThresholds } from "@/lib/posture";

const DEFAULT_METRICS: PostureMetrics = {
  headTiltAngle: 0,
  shoulderTiltAngle: 0,
  neckForwardScore: 0,
  spineTiltAngle: 0,
  overallScore: 0,
  status: "good",
  isDetected: false,
};

interface UsePostureMetricsOptions {
  headAngleThreshold?: { warning: number; bad: number };
  shoulderThreshold?: { warning: number; bad: number };
  spineAngleThreshold?: { warning: number; bad: number };
}

export function usePostureMetrics(
  landmarks: NormalizedLandmark[][] | null,
  options: UsePostureMetricsOptions = {}
): PostureMetrics {
  return useMemo(() => {
    if (!landmarks || landmarks.length === 0) return DEFAULT_METRICS;

    const thresholds: PostureThresholds = {
      headAngle: options.headAngleThreshold ?? DEFAULT_POSTURE_THRESHOLDS.headAngle,
      shoulder: options.shoulderThreshold ?? DEFAULT_POSTURE_THRESHOLDS.shoulder,
      spineAngle: options.spineAngleThreshold ?? DEFAULT_POSTURE_THRESHOLDS.spineAngle,
    };

    return analyzePosture(landmarks[0], thresholds);
  }, [landmarks, options.headAngleThreshold, options.shoulderThreshold, options.spineAngleThreshold]);
}
