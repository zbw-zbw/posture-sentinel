"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG } from "@/lib/mediapipe-config";

export interface UsePoseDetectionReturn {
  landmarks: NormalizedLandmark[][] | null;
  isModelLoading: boolean;
  isDetecting: boolean;
  fps: number;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseDetection(targetFps: number = 15): UsePoseDetectionReturn {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[][] | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const lastDetectTimeRef = useRef<number>(0);
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectingRef = useRef<boolean>(false);
  const detectFrameRef = useRef<() => void>(() => {});
  const targetFpsRef = useRef<number>(targetFps);

  // Keep target fps in sync without recreating callbacks
  useEffect(() => {
    targetFpsRef.current = targetFps;
  }, [targetFps]);

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_CONFIG.modelAssetPath,
          delegate: "GPU",
        },
        runningMode: MEDIAPIPE_CONFIG.runningMode,
        numPoses: MEDIAPIPE_CONFIG.numPoses,
        minPoseDetectionConfidence: MEDIAPIPE_CONFIG.minPoseDetectionConfidence,
        minPosePresenceConfidence: MEDIAPIPE_CONFIG.minPosePresenceConfidence,
        minTrackingConfidence: MEDIAPIPE_CONFIG.minTrackingConfidence,
      });
    } catch (err) {
      console.error("Failed to load pose model:", err);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const detectFrame = useCallback(() => {
    if (!detectingRef.current || !landmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.paused || video.ended) {
      animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
      return;
    }

    // Pause detection when tab is hidden
    if (document.hidden) {
      animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
      return;
    }

    const now = performance.now();
    const minInterval = 1000 / Math.max(1, targetFpsRef.current);

    // Throttle detection to the configured target FPS
    if (now - lastDetectTimeRef.current >= minInterval) {
      lastDetectTimeRef.current = now;
      try {
        const results = landmarkerRef.current.detectForVideo(video, now);
        if (results.landmarks && results.landmarks.length > 0) {
          const prevLandmarks = prevLandmarksRef.current;
          if (prevLandmarks) {
            const current = results.landmarks[0];
            let maxDiff = 0;
            for (let i = 0; i < Math.min(current.length, prevLandmarks.length); i++) {
              const dx = Math.abs(current[i].x - prevLandmarks[i].x);
              const dy = Math.abs(current[i].y - prevLandmarks[i].y);
              maxDiff = Math.max(maxDiff, dx, dy);
            }
            if (maxDiff < 0.003) { // skip very small changes
              // still count fps but don't update landmarks
            } else {
              prevLandmarksRef.current = structuredClone(results.landmarks[0]);
              setLandmarks(results.landmarks);
            }
          } else {
            prevLandmarksRef.current = structuredClone(results.landmarks[0]);
            setLandmarks(results.landmarks);
          }
        }
      } catch {
        // Frame skipped silently
      }
    }

    // FPS calculation
    frameCountRef.current++;
    if (now - lastFpsUpdateRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
  }, []);

  // Keep detectFrameRef pointing to latest detectFrame callback
  useEffect(() => {
    detectFrameRef.current = detectFrame;
  }, [detectFrame]);

  const startDetection = useCallback(
    async (video: HTMLVideoElement) => {
      videoRef.current = video;
      await loadModel();
      if (!landmarkerRef.current) return;
      detectingRef.current = true;
      setIsDetecting(true);
      lastFpsUpdateRef.current = performance.now();
      lastDetectTimeRef.current = performance.now();
      frameCountRef.current = 0;
      animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
    },
    [loadModel]
  );

  const stopDetection = useCallback(() => {
    detectingRef.current = false;
    setIsDetecting(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setFps(0);
    setLandmarks(null);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [stopDetection]);

  return { landmarks, isModelLoading, isDetecting, fps, startDetection, stopDetection };
}
