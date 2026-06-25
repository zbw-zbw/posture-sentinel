"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("您的浏览器不支持摄像头访问，请升级浏览器。");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (err) {
      const e = err as Error;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("摄像头权限被拒绝。请在浏览器地址栏点击锁图标，允许摄像头访问。");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setError("未检测到摄像头设备。请连接摄像头后重试。");
      } else {
        setError(e.message || "摄像头启动失败，请重试。");
      }
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, isLoading, isActive, error, startCamera, stopCamera };
}
