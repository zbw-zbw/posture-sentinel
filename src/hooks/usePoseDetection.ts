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

// Model and WASM CDN URLs
const WASM_CDN_URL = MEDIAPIPE_CONFIG.wasmPath;
const MODEL_CDN_URLS = [
  MEDIAPIPE_CONFIG.modelAssetPath,
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm/pose_landmarker_lite.task",
];
const LOAD_TIMEOUT_MS = 45_000;

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
  // Display throttle: update landmarks state at most ~8Hz to reduce React re-renders
  // Detection still runs at full targetFps; only the state update is throttled
  const lastStateUpdateRef = useRef<number>(0);
  const STATE_UPDATE_INTERVAL_MS = 120; // ~8Hz display refresh

  useEffect(() => {
    targetFpsRef.current = targetFps;
  }, [targetFps]);

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    setIsModelLoading(true);
    setLoadError(null);

    // Step 1: Resolve WASM — try CDN only (relative paths don't work with FilesetResolver)
    let vision;
    try {
      vision = await withTimeout(
        FilesetResolver.forVisionTasks(WASM_CDN_URL),
        LOAD_TIMEOUT_MS
      );
    } catch (err) {
      console.error("Failed to resolve WASM:", err);
      throw new Error("WASM 加载失败，请检查网络连接");
    }

    // Step 2: Try loading model from CDN URLs with GPU then CPU fallback
    let lastError: Error | null = null;

    for (const delegate of ["GPU", "CPU"] as const) {
      for (const modelUrl of MODEL_CDN_URLS) {
        try {
          landmarkerRef.current = await withTimeout(
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelUrl,
                delegate: delegate,
              },
              runningMode: MEDIAPIPE_CONFIG.runningMode,
              numPoses: MEDIAPIPE_CONFIG.numPoses,
              minPoseDetectionConfidence: MEDIAPIPE_CONFIG.minPoseDetectionConfidence,
              minPosePresenceConfidence: MEDIAPIPE_CONFIG.minPosePresenceConfidence,
              minTrackingConfidence: MEDIAPIPE_CONFIG.minTrackingConfidence,
            }),
            LOAD_TIMEOUT_MS
          );
          return; // Success
        } catch (err) {
          lastError = err as Error;
          console.warn(`Failed (${delegate}, ${modelUrl}):`, err);
          if (landmarkerRef.current) {
            try { landmarkerRef.current.close(); } catch { /* ignore */ }
            landmarkerRef.current = null;
          }
        }
      }
    }

    throw lastError || new Error("所有模型加载尝试均失败");
  }, []);

  const detectFrame = useCallback(() => {
    if (!detectingRef.current || !landmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.paused || video.ended || document.hidden) {
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
          const current = results.landmarks[0];
          // Always update diff ref so movement is tracked at full FPS
          prevLandmarksRef.current = current.map(p => ({ x: p.x, y: p.y, z: p.z, visibility: p.visibility }));

          // Determine if enough movement occurred to warrant a display update
          let hasMovement = true; // default true for first frame
          if (prevLandmarks) {
            let maxDiff = 0;
            for (let i = 0; i < Math.min(current.length, prevLandmarks.length); i++) {
              const dx = Math.abs(current[i].x - prevLandmarks[i].x);
              const dy = Math.abs(current[i].y - prevLandmarks[i].y);
              maxDiff = Math.max(maxDiff, dx, dy);
            }
            hasMovement = maxDiff >= 0.003;
          }

          // Throttle state updates to ~8Hz to reduce React re-render cascade
          // Detection & diffing still run at full targetFps
          if (hasMovement && now - lastStateUpdateRef.current >= STATE_UPDATE_INTERVAL_MS) {
            lastStateUpdateRef.current = now;
            setLandmarks(results.landmarks);
          }
        }
      } catch {
        // Frame skipped
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
      // Idempotent guard: prevent duplicate RAF chains if called twice
      if (detectingRef.current) return;
      detectingRef.current = true;
      setIsDetecting(true);
      lastFpsUpdateRef.current = performance.now();
      lastDetectTimeRef.current = performance.now();
      lastStateUpdateRef.current = 0; // Allow immediate first frame render
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
