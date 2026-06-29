"use client";

import { PostureMetrics, PostureStatus } from "@/lib/posture";
import { useEffect, useState, useRef } from "react";

interface MetricsPanelProps {
  metrics: PostureMetrics;
  fps: number;
  sessionDuration: number;
  isDetecting: boolean;
  statusDuration?: number;
  currentStatus?: PostureStatus;
  alertCount?: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const statusConfig: Record<PostureStatus, { label: string; color: string; bg: string }> = {
  good: { label: "坐姿良好", color: "text-primary", bg: "bg-primary-light" },
  warning: { label: "请注意坐姿", color: "text-warning", bg: "bg-warning-light" },
  bad: { label: "坐姿不良", color: "text-danger", bg: "bg-danger-light" },
};

interface MetricCardProps {
  name: string;
  value: number;
  unit: string;
  threshold: string;
  progress: number;
  color: string;
}

function MetricCard({ name, value, unit, threshold, progress, color }: MetricCardProps) {
  return (
    <div className="bg-surface-alt rounded-xl p-4">
      <p className="text-text-muted text-xs">{name}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums" style={{ transition: "all 0.3s ease" }}>
        {value}<span className="text-sm font-normal text-text-muted ml-1">{unit}</span>
      </p>
      <p className="text-xs text-text-muted mt-1">{threshold}</p>
      <div className="mt-2 bg-border rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function MetricsPanel({
  metrics,
  fps,
  sessionDuration,
  isDetecting,
  statusDuration = 0,
  currentStatus = "good",
  alertCount = 0,
}: MetricsPanelProps) {
  const config = statusConfig[currentStatus];
  const isUnknown = isDetecting && !metrics.isDetected;
  const [displayFps, setDisplayFps] = useState(0);
  const prevFpsRef = useRef(0);

  useEffect(() => {
    if (fps !== prevFpsRef.current) {
      setDisplayFps(fps);
      prevFpsRef.current = fps;
    }
  }, [fps]);

  const metricCards = [
    {
      name: "头部倾斜",
      value: metrics.headTiltAngle,
      unit: "°",
      threshold: "正常 < 5°",
      progress: Math.min((metrics.headTiltAngle / 15) * 100, 100),
      color: metrics.headTiltAngle > 10 ? "#ef4444" : metrics.headTiltAngle > 5 ? "#f59e0b" : "#10b981",
    },
    {
      name: "肩膀倾斜",
      value: metrics.shoulderTiltAngle,
      unit: "°",
      threshold: "正常 < 3°",
      progress: Math.min((metrics.shoulderTiltAngle / 8) * 100, 100),
      color: metrics.shoulderTiltAngle > 6 ? "#ef4444" : metrics.shoulderTiltAngle > 3 ? "#f59e0b" : "#10b981",
    },
    {
      name: "脖子前倾",
      value: metrics.neckForwardScore,
      unit: "%",
      threshold: "正常 < 30%",
      progress: metrics.neckForwardScore,
      color: metrics.neckForwardScore > 60 ? "#ef4444" : metrics.neckForwardScore > 30 ? "#f59e0b" : "#10b981",
    },
    {
      name: "脊椎倾斜",
      value: metrics.spineTiltAngle,
      unit: "°",
      threshold: "正常 < 5°",
      progress: Math.min((metrics.spineTiltAngle / 15) * 100, 100),
      color: metrics.spineTiltAngle > 10 ? "#ef4444" : metrics.spineTiltAngle > 5 ? "#f59e0b" : "#10b981",
    },
  ];

  const formatStatusDuration = (seconds: number, status: PostureStatus): string => {
    if (status === "good") {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      if (m > 0) {
        return `已持续 ${m}分${s.toString().padStart(2, "0")}秒`;
      }
      return `已持续 ${s}秒`;
    }
    return `已持续 ${seconds}秒`;
  };

  const statusDurationText = formatStatusDuration(statusDuration, currentStatus);

  if (!isDetecting) {
    return (
      <div className="bg-surface-alt rounded-2xl p-8 text-center">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <p className="text-sm text-text-muted">开始检测后，这里将显示实时数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div
        className={`${
          isUnknown
            ? "bg-surface-alt text-text-muted"
            : `${config.bg} ${config.color}`
        } font-semibold text-lg px-5 py-3 rounded-2xl flex items-center gap-3 w-full sm:w-fit`}
      >
        {isUnknown && (
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" y1="11" x2="22" y2="16" />
            <line x1="22" y1="11" x2="17" y2="16" />
          </svg>
        )}
        <span
          className={`flex-shrink-0 w-3 h-3 rounded-full inline-block ${
            !isUnknown && currentStatus === "good" ? "animate-pulse-green" : ""
          }`}
          style={{
            backgroundColor: isUnknown
              ? "#9ca3af"
              : currentStatus === "good"
                ? "#10b981"
                : currentStatus === "warning"
                  ? "#f59e0b"
                  : "#ef4444",
          }}
        />
        <span>{isUnknown ? "未检测到人体" : config.label}</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((card) => (
          <MetricCard key={card.name} {...card} />
        ))}
      </div>

      {/* Session Info */}
      <div className="mt-2 pt-4">
        {/* Status duration */}
        {isDetecting && statusDuration > 0 && !isUnknown && (
          <p className={`text-sm mb-3 ${currentStatus === "good" ? "text-primary" : "text-danger"}`}>
            {statusDurationText}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>检测帧率：{displayFps} FPS</span>
          <span>会话时长：{formatDuration(sessionDuration)}</span>
        </div>

        {alertCount > 0 && (
          <p className="text-sm text-text-muted mt-1">
            本次提醒次数：{alertCount}次
          </p>
        )}

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-text-secondary">当前评分</span>
            <span className="font-semibold text-text-primary">{metrics.overallScore}/100</span>
          </div>
          <div className="bg-border rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary-dark"
              style={{ width: `${metrics.overallScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}