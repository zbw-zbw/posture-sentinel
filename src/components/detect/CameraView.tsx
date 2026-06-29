"use client";

import { useRef, useEffect, useState } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PostureStatus } from "@/lib/posture";
import SkeletonOverlay from "./SkeletonOverlay";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: NormalizedLandmark[][] | null;
  status: PostureStatus;
  isActive: boolean;
  isDetecting: boolean;
  isModelLoading: boolean;
  loadError?: string | null;
  isRequestingPermission?: boolean;
  error: string | null;
  headTiltAngle?: number;
}

export default function CameraView({
  videoRef,
  landmarks,
  status,
  isActive,
  isDetecting,
  isModelLoading,
  loadError,
  isRequestingPermission = false,
  error,
  headTiltAngle = 0,
}: CameraViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ width: 640, height: 480 });

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const h = Math.round(rect.width * 0.75); // 4:3 aspect
        setDims({ width: Math.round(rect.width), height: h });
      }
    };
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  const statusLabel = {
    good: "坐姿良好",
    warning: "请注意坐姿",
    bad: "坐姿不良",
  };

  const statusColor = {
    good: "bg-primary",
    warning: "bg-warning",
    bad: "bg-danger",
  };

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden bg-dark"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Hidden video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />

        {/* Canvas overlay */}
        {isActive && (
          <SkeletonOverlay
            landmarks={landmarks}
            status={status}
            width={dims.width}
            height={dims.height}
            videoRef={videoRef}
            headTiltAngle={headTiltAngle}
          />
        )}

        {/* REC indicator */}
        {isDetecting && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-danger animate-blink-rec" />
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}

        {/* AI detecting label */}
        {isDetecting && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-green" />
            <span className="text-white text-sm">AI 检测中...</span>
          </div>
        )}

        {/* Model loading */}
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/80">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white text-sm mt-3">AI 模型加载中...</p>
              <p className="text-white/60 text-xs mt-1">首次加载约 3-5 秒，后续秒开</p>
            </div>
          </div>
        )}

        {/* Model load error */}
        {loadError && isActive && !isModelLoading && !isDetecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/80">
            <div className="text-center max-w-xs px-4">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-warning mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-white text-sm font-medium">模型加载失败</p>
              <p className="text-white/60 text-xs mt-1">请检查网络连接后刷新页面重试</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                刷新重试
              </button>
            </div>
          </div>
        )}

        {/* Requesting permission */}
        {!isActive && !error && !isModelLoading && isRequestingPermission && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/80">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white text-sm mt-3">正在请求摄像头权限...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/90 p-6">
            <div className="text-center max-w-sm">
              <div className="mb-3">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-white font-medium mb-2">摄像头无法启动</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Idle state overlay */}
        {!isActive && !error && !isModelLoading && !isRequestingPermission && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl m-4">
            <div className="text-center">
              <div className="mb-4 opacity-50">
                <svg viewBox="0 0 24 24" className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">点击「开始检测」启动摄像头</p>
            </div>
          </div>
        )}

        {/* Status label */}
        {isDetecting && landmarks && landmarks.length > 0 && (
          <div className={`absolute top-4 right-4 ${statusColor[status]} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
            {statusLabel[status]}
          </div>
        )}
      </div>

      {/* Permission hint */}
      {!isActive && !error && (
        <p className="text-text-muted text-xs text-center mt-3">
          需要访问摄像头来进行坐姿检测。所有数据仅在本地处理，不会上传。
        </p>
      )}
    </div>
  );
}
