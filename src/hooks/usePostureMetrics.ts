"use client";

import { useMemo } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { calculateOverallScore, PostureMetrics } from "@/lib/posture";

export function usePostureMetrics(
  landmarks: NormalizedLandmark[][] | null
): PostureMetrics {
  return useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return {
        headForwardAngle: 0,
        shoulderSymmetry: 100,
        forwardLean: 0,
        spineAngle: 0,
        overallScore: 0,
        status: "good" as const,
      };
    }
    return calculateOverallScore(landmarks[0]);
  }, [landmarks]);
}
