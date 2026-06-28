"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ── Animated Counter ── */
function AnimatedValue({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const duration = 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <>{decimals > 0 ? value.toFixed(decimals) : Math.round(value)}{suffix}</>
  );
}

/* ── Metric Card ── */
function MetricCard({
  name,
  value,
  suffix,
  status,
  statusClass,
  progressPercent,
}: {
  name: string;
  value: number;
  suffix: string;
  status: string;
  statusClass: string;
  progressPercent: number;
}) {
  return (
    <div className="bg-surface-alt rounded-xl p-4">
      <div className="text-text-muted text-xs">{name}</div>
      <div className="text-2xl font-bold text-text-primary mt-1">
        <AnimatedValue target={value} suffix={suffix} />
      </div>
      <span
        className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${statusClass}`}
      >
        {status}
      </span>
      <div className="bg-border rounded-full h-1.5 overflow-hidden mt-3">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

/* ── Skeleton SVG (side-view sitting person) ── */
function SkeletonSVG() {
  return (
    <svg
      viewBox="0 0 300 400"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connecting lines */}
      <g stroke="#10b981" strokeWidth="2" fill="none">
        {/* Head top → ears */}
        <line x1="150" y1="20" x2="120" y2="45" />
        <line x1="150" y1="20" x2="180" y2="45" />

        {/* Ears → shoulders */}
        <line x1="120" y1="45" x2="105" y2="90" />
        <line x1="180" y1="45" x2="195" y2="90" />

        {/* Shoulder line */}
        <line x1="105" y1="90" x2="195" y2="90" />

        {/* Shoulders → spine midpoint */}
        <line x1="105" y1="90" x2="150" y2="175" />
        <line x1="195" y1="90" x2="150" y2="175" />

        {/* Spine midpoint → hip */}
        <line x1="150" y1="175" x2="150" y2="280" />
      </g>

      {/* Dashed spine line */}
      <line
        x1="150"
        y1="90"
        x2="150"
        y2="280"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.6"
      />

      {/* Keypoints */}
      {[
        [150, 20],   // top of head
        [120, 45],   // ear left
        [180, 45],   // ear right
        [105, 90],   // shoulder left
        [195, 90],   // shoulder right
        [150, 175],  // spine midpoint
        [150, 280],  // hip
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="6"
          fill="#10b981"
          stroke="#fff"
          strokeWidth="2"
        />
      ))}

      {/* Head outline */}
      <circle
        cx="150"
        cy="30"
        r="20"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Angle label near head */}
      <g transform="translate(196, 18)">
        <rect
          x="-16"
          y="-10"
          width="32"
          height="20"
          rx="6"
          fill="#10b981"
          opacity="0.9"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          5°
        </text>
      </g>
    </svg>
  );
}

/* ── Main Component ── */
export default function DetectionMockupSection() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-24 fade-in">
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">
        实时检测界面
      </h2>
      <p className="text-text-secondary text-center mt-3">
        这就是你打开体态哨兵后看到的样子
      </p>

      {/* Demo hint banner */}
      <div className="bg-primary-light text-primary-dark text-sm font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 mx-auto mb-4">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg> 这是演示效果，点击体验
        <Link href="/detect" className="underline hover:no-underline inline-flex items-center gap-1">真实检测
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Main Mockup Card */}
      <div className="bg-surface rounded-[20px] shadow-xl overflow-hidden mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ─── Left Column: Camera Preview ─── */}
          <div className="bg-dark p-6 relative min-h-[400px] flex flex-col justify-between">
            {/* SVG Canvas */}
            <div className="absolute inset-0 p-4 pt-10">
              <SkeletonSVG />
            </div>

            {/* Top-left REC indicator */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block animate-blink-rec" />
              <span className="text-white text-sm font-medium">REC</span>
            </div>

            {/* Bottom row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">AI 检测中...</span>
                <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse-green" />
              </div>
              <span className="text-text-muted text-xs">00:23:15</span>
            </div>
          </div>

          {/* ─── Right Column: Data Panel ─── */}
          <div className="p-6 md:p-8">
            {/* Status Badge */}
            <div className="bg-primary-light text-primary font-semibold text-xl inline-block px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
              坐姿良好
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <MetricCard
                name="头部前倾"
                value={5}
                suffix="°"
                status="正常"
                statusClass="bg-primary-light text-primary"
                progressPercent={30}
              />
              <MetricCard
                name="肩膀对称"
                value={96}
                suffix="%"
                status="正常"
                statusClass="bg-primary-light text-primary"
                progressPercent={96}
              />
              <MetricCard
                name="前倾距离"
                value={2}
                suffix="cm"
                status="正常"
                statusClass="bg-primary-light text-primary"
                progressPercent={40}
              />
              <MetricCard
                name="脊椎弧度"
                value={8}
                suffix="°"
                status="正常"
                statusClass="bg-primary-light text-primary"
                progressPercent={50}
              />
            </div>

            {/* Bottom Info Strip */}
            <div className="mt-6 pt-4">
              <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                <span className="text-sm text-text-secondary">
                  持续良好坐姿：23分钟
                </span>
                <span className="text-sm text-text-secondary">
                  今日提醒次数：3次
                </span>
              </div>

              {/* Score Bar */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm text-text-secondary">
                  今日坐姿评分 87/100
                </span>
                <div className="bg-border rounded-full h-2 flex-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000 ease-out"
                    style={{ width: "87%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}