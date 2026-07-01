"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PostureMetrics {
  headTiltAngle: number;
  shoulderTiltAngle: number;
  neckForwardScore: number;
  spineTiltAngle: number;
}

interface BaselineSamplingProps {
  /** Real-time posture metrics from the parent */
  metrics: PostureMetrics | null;
  /** Whether pose detection is active (landmarks being detected) */
  isActive: boolean;
  /** Callback when baseline is successfully captured */
  onCapture: (data: { headTilt: number; shoulderTilt: number; neckForward: number; spineTilt: number }) => void;
  /** Callback to cancel sampling */
  onCancel: () => void;
}

const SAMPLE_DURATION = 4; // seconds

export default function BaselineSampling({ metrics, isActive, onCapture, onCancel }: BaselineSamplingProps) {
  const [phase, setPhase] = useState<"prepare" | "sampling" | "success">("prepare");
  const [countdown, setCountdown] = useState(SAMPLE_DURATION);
  const [quality, setQuality] = useState<"waiting" | "good" | "adjust">("waiting");
  const [qualityMessage, setQualityMessage] = useState("请坐直，面向摄像头");
  const samplesRef = useRef<{ headTilt: number[]; shoulderTilt: number[]; neckForward: number[]; spineTilt: number[] }>({
    headTilt: [],
    shoulderTilt: [],
    neckForward: [],
    spineTilt: [],
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check posture quality in real-time
  useEffect(() => {
    if (!metrics || phase !== "sampling") {
      setQuality("waiting");
      return;
    }

    // Quality check: angles should be relatively small (user sitting straight)
    const headOk = Math.abs(metrics.headTiltAngle) < 25;
    const shoulderOk = Math.abs(metrics.shoulderTiltAngle) < 15;
    const spineOk = Math.abs(metrics.spineTiltAngle) < 15;

    if (headOk && shoulderOk && spineOk) {
      setQuality("good");
      setQualityMessage("很好，保持这个姿势");
    } else {
      setQuality("adjust");
      if (!headOk) setQualityMessage("头部偏斜较多，请调整到正中");
      else if (!shoulderOk) setQualityMessage("肩膀不对称，请放松双肩");
      else setQualityMessage("身体倾斜，请坐正");
    }
  }, [metrics, phase]);

  // Sampling countdown
  useEffect(() => {
    if (phase !== "sampling") return;

    intervalRef.current = setInterval(() => {
      // Only count down when quality is good and we have metrics
      if (metrics && quality === "good") {
        // Record sample
        samplesRef.current.headTilt.push(metrics.headTiltAngle);
        samplesRef.current.shoulderTilt.push(metrics.shoulderTiltAngle);
        samplesRef.current.neckForward.push(metrics.neckForwardScore);
        samplesRef.current.spineTilt.push(metrics.spineTiltAngle);

        setCountdown((prev) => {
          if (prev <= 1) {
            // Sampling complete - compute averages
            const s = samplesRef.current;
            const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

            onCapture({
              headTilt: avg(s.headTilt),
              shoulderTilt: avg(s.shoulderTilt),
              neckForward: avg(s.neckForward),
              spineTilt: avg(s.spineTilt),
            });
            setPhase("success");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, metrics, quality, onCapture]);

  const startSampling = useCallback(() => {
    samplesRef.current = { headTilt: [], shoulderTilt: [], neckForward: [], spineTilt: [] };
    setCountdown(SAMPLE_DURATION);
    setPhase("sampling");
  }, []);

  // Progress ring for countdown
  const progress = phase === "sampling" ? (SAMPLE_DURATION - countdown) / SAMPLE_DURATION : 0;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <h3 className="text-xl font-bold text-text-primary text-center mb-2">
          {phase === "prepare" && "个人姿态校准"}
          {phase === "sampling" && "保持坐姿..."}
          {phase === "success" && "校准完成！"}
        </h3>
        <p className="text-sm text-text-secondary text-center mb-6">
          {phase === "prepare" && "接下来请保持标准坐姿 4 秒，系统将记录你的个人基线"}
          {phase === "sampling" && "请保持当前姿势不要移动"}
          {phase === "success" && "你的个人姿态基线已保存，检测将基于此标准"}
        </p>

        {phase === "prepare" && (
          <div className="text-center">
            {/* Instructions */}
            <div className="bg-surface-alt rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-text-primary font-medium mb-2">标准坐姿要点：</p>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  双脚平放地面，膝盖呈 90 度
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  背部挺直，肩膀放松自然下垂
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  头部正中，眼睛平视屏幕
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  确保摄像头能拍到上半身
                </li>
              </ul>
            </div>

            {!isActive ? (
              <p className="text-sm text-warning mb-4">请先开启摄像头</p>
            ) : (
              <p className="text-sm text-primary mb-4">摄像头已就绪，可以开始采样</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={startSampling}
                disabled={!isActive}
                className={`flex-1 font-medium py-2.5 rounded-xl transition-colors text-sm ${
                  isActive
                    ? "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25"
                    : "bg-surface-alt text-text-muted cursor-not-allowed"
                }`}
              >
                开始采样
              </button>
            </div>
          </div>
        )}

        {phase === "sampling" && (
          <div className="text-center">
            {/* Countdown ring */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-linear ${
                    quality === "good" ? "text-primary" : "text-warning"
                  }`}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-text-primary tabular-nums">{countdown}</span>
                <span className="text-xs text-text-muted">秒</span>
              </div>
            </div>

            {/* Quality indicator */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                quality === "good"
                  ? "bg-primary-light text-primary"
                  : quality === "adjust"
                  ? "bg-warning-light text-warning"
                  : "bg-surface-alt text-text-muted"
              }`}
            >
              {quality === "good" && (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {quality === "adjust" && (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              {qualityMessage}
            </div>

            {quality === "adjust" && (
              <p className="text-xs text-text-muted">调整姿势后采样将继续</p>
            )}

            <button
              onClick={onCancel}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              取消采样
            </button>
          </div>
        )}

        {phase === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <button
              onClick={onCancel}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-primary/25"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
