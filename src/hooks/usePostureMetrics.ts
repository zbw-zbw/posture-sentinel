"use client";

import { useMemo } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { analyzePosture, type PostureMetrics } from "@/lib/posture";

const DEFAULT_METRICS: PostureMetrics = {
  headTiltAngle: 0,
  shoulderTiltAngle: 0,
  neckForwardScore: 0,
  spineTiltAngle: 0,
  overallScore: 0,
  status: "good",
  isDetected: false,
};

export function usePostureMetrics(landmarks: NormalizedLandmark[][] | null): PostureMetrics {
  return useMemo(() => {
    if (!landmarks || landmarks.length === 0) return DEFAULT_METRICS;
    return analyzePosture(landmarks[0]);
  }, [landmarks]);
}
