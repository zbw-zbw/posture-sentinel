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
      name: "头部前倾",
      value: metrics.headForwardAngle,
      unit: "°",
      threshold: "正常 < 15°",
      progress: Math.min((metrics.headForwardAngle / 30) * 100, 100),
      color: metrics.headForwardAngle > 25 ? "#ef4444" : metrics.headForwardAngle > 15 ? "#f59e0b" : "#10b981",
    },
    {
      name: "肩膀对称",
      value: metrics.shoulderSymmetry,
      unit: "%",
      threshold: "正常 > 85%",
      progress: metrics.shoulderSymmetry,
      color: metrics.shoulderSymmetry < 70 ? "#ef4444" : metrics.shoulderSymmetry < 85 ? "#f59e0b" : "#10b981",
    },
    {
      name: "前倾距离",
      value: metrics.forwardLean,
      unit: "cm",
      threshold: "正常 < 5cm",
      progress: Math.min((metrics.forwardLean / 15) * 100, 100),
      color: metrics.forwardLean > 10 ? "#ef4444" : metrics.forwardLean > 5 ? "#f59e0b" : "#10b981",
    },
    {
      name: "脊椎弧度",
      value: metrics.spineAngle,
      unit: "°",
      threshold: "正常 < 20°",
      progress: Math.min((metrics.spineAngle / 40) * 100, 100),
      color: metrics.spineAngle > 35 ? "#ef4444" : metrics.spineAngle > 20 ? "#f59e0b" : "#10b981",
    },
  ];

  const statusDurationText = currentStatus === "good"
    ? `良好坐姿已持续 ${formatDuration(statusDuration)}`
    : `不良坐姿已持续 ${statusDuration}秒`;

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className={`${config.bg} ${config.color} font-semibold text-xl inline-block px-4 py-2.5 rounded-full flex items-center gap-2 w-fit`}>
        <span className={currentStatus === "good" ? "animate-pulse-green inline-block w-3 h-3 rounded-full bg-primary" : "inline-block w-3 h-3 rounded-full"} style={{ backgroundColor: currentStatus === "good" ? "#10b981" : currentStatus === "warning" ? "#f59e0b" : "#ef4444" }} />
        {config.label}
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
        {isDetecting && statusDuration > 0 && (
          <p className={`text-sm mb-3 ${currentStatus === "good" ? "text-primary" : "text-danger"}`}>
            {statusDurationText}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>检测帧率：{isDetecting ? displayFps : 0} FPS</span>
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