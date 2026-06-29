"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG } from "@/lib/mediapipe-config";

export interface UsePoseDetectionReturn {
  landmarks: NormalizedLandmark[][] | null;
  isModelLoading: boolean;
  isDetecting: boolean;
  loadError: string | null;
  fps: number;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

// Model file URLs to try in order (primary → fallback CDN mirrors)
const MODEL_URLS = [
  MEDIAPIPE_CONFIG.modelAssetPath,
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm/pose_landmarker_lite.task",
];

const WASM_URL = MEDIAPIPE_CONFIG.wasmPath;
const DELEGATES = ["gpu", "cpu"] as const;
const LOAD_TIMEOUT_MS = 30_000; // 30 seconds max per attempt

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Loading timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export function usePoseDetection(targetFps: number = 15): UsePoseDetectionReturn {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[][] | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    targetFpsRef.current = targetFps;
  }, [targetFps]);

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    setIsModelLoading(true);
    setLoadError(null);

    try {
      const vision = await withTimeout(
        FilesetResolver.forVisionTasks(WASM_URL),
        LOAD_TIMEOUT_MS
      );

      let lastError: Error | null = null;

      // Try each delegate (GPU first, then CPU)
      for (const delegate of DELEGATES) {
        // Try each model URL
        for (const modelUrl of MODEL_URLS) {
          try {
            landmarkerRef.current = await withTimeout(
              PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: modelUrl,
                  delegate: delegate.toUpperCase() as "GPU" | "CPU",
                },
                runningMode: MEDIAPIPE_CONFIG.runningMode,
                numPoses: MEDIAPIPE_CONFIG.numPoses,
                minPoseDetectionConfidence: MEDIAPIPE_CONFIG.minPoseDetectionConfidence,
                minPosePresenceConfidence: MEDIAPIPE_CONFIG.minPosePresenceConfidence,
                minTrackingConfidence: MEDIAPIPE_CONFIG.minTrackingConfidence,
              }),
              LOAD_TIMEOUT_MS
            );
            return; // Success!
          } catch (err) {
            lastError = err as Error;
            console.warn(`Failed to load model (${delegate}, ${modelUrl}):`, err);
            // Clean up failed landmarker
            if (landmarkerRef.current) {
              try { landmarkerRef.current.close(); } catch { /* ignore */ }
              landmarkerRef.current = null;
            }
          }
        }
      }

      throw lastError || new Error("All model loading attempts failed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to load pose model:", message);
      setLoadError(message);
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

    if (document.hidden) {
      animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
      return;
    }

    const now = performance.now();
    const minInterval = 1000 / Math.max(1, targetFpsRef.current);

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
            if (maxDiff < 0.003) {
              // Skip small changes
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

    frameCountRef.current++;
    if (now - lastFpsUpdateRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    animFrameRef.current = requestAnimationFrame(() => detectFrameRef.current());
  }, []);

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

  return { landmarks, isModelLoading, isDetecting, loadError, fps, startDetection, stopDetection };
}
