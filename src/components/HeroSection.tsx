"use client";

import { useEffect, useState, useRef } from "react";

export default function HeroSection() {
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0 });
  const countedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countedRef.current) {
            countedRef.current = true;
            // Animate counts
            const duration = 1500;
            const start = performance.now();
            const targets = { a: 3, b: 50, c: 8 };
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const ease = 1 - Math.pow(1 - p, 3);
              setCounts({
                a: Math.round(ease * targets.a * 10) / 10,
                b: Math.round(ease * targets.b),
                c: Math.round(ease * targets.c),
              });
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );
    const el = document.getElementById("hero-stats");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="relative overflow-hidden py-24 px-6 text-center">
      {/* Background SVG - Sitting Posture Skeleton */}
      <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none opacity-5 select-none">
        <svg
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto ml-auto"
          preserveAspectRatio="xMaxYMid meet"
        >
          {/* Head */}
          <ellipse cx="200" cy="60" rx="40" ry="45" stroke="currentColor" strokeWidth="3" fill="none" />
          {/* Neck */}
          <line x1="200" y1="105" x2="200" y2="150" stroke="currentColor" strokeWidth="3" />
          {/* Shoulder */}
          <path d="M140 160 C160 170, 200 170, 200 170 C200 170, 240 170, 260 160" stroke="currentColor" strokeWidth="3" fill="none" />
          {/* Spine - C curve */}
          <path
            d="M200 150 C205 180, 210 210, 205 250 C195 300, 185 350, 190 400 C195 450, 200 500, 200 520"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          {/* Lumbar / Pelvis */}
          <path
            d="M200 520 C195 540, 185 560, 175 580 L175 600 M200 520 C205 540, 215 560, 225 580 L225 600"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          {/* Spine keypoints - green dots */}
          <circle cx="200" cy="130" r="5" fill="#10b981" />
          <circle cx="205" cy="200" r="5" fill="#10b981" />
          <circle cx="195" cy="300" r="5" fill="#10b981" />
          <circle cx="192" cy="380" r="5" fill="#10b981" />
          <circle cx="197" cy="450" r="5" fill="#10b981" />
          <circle cx="200" cy="520" r="5" fill="#10b981" />
          {/* Left arm hanging down */}
          <path d="M140 160 C130 200, 120 280, 115 350" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Right arm hanging down */}
          <path d="M260 160 C270 200, 280 280, 285 350" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Head tilt indicator (forward head posture) */}
          <line x1="200" y1="105" x2="200" y2="150" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto fade-in">
        {/* Main Title */}
        <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold text-text-primary mt-6">
          体态哨兵
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary mt-4">
          打开摄像头，AI 守护你的每一寸脊椎
        </p>

        {/* Stat Cards Row */}
        <div id="hero-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
          {/* Card 1 - Green */}
          <div className="bg-surface rounded-xl p-4 flex gap-3 items-center border-l-4 border-primary">
            <span className="w-3 h-3 rounded-full inline-block bg-primary shrink-0" />
            <div className="text-left">
              <p className="text-text-primary font-semibold">{counts.a}亿 — 中国颈椎病患者</p>
            </div>
          </div>

          {/* Card 2 - Orange */}
          <div className="bg-surface rounded-xl p-4 flex gap-3 items-center border-l-4 border-warning">
            <span className="w-3 h-3 rounded-full inline-block bg-warning shrink-0" />
            <div className="text-left">
              <p className="text-text-primary font-semibold">{counts.b}% — 不到30岁的年轻人</p>
            </div>
          </div>

          {/* Card 3 - Red */}
          <div className="bg-surface rounded-xl p-4 flex gap-3 items-center border-l-4 border-danger">
            <span className="w-3 h-3 rounded-full inline-block bg-danger shrink-0" />
            <div className="text-left">
              <p className="text-text-primary font-semibold">{counts.c}小时 — 日均久坐时长</p>
            </div>
          </div>
        </div>

        {/* Keywords Row */}
        <div className="flex justify-center gap-2 mt-8">
          <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">
            零成本
          </span>
          <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">
            零穿戴
          </span>
          <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">
            零门槛
          </span>
        </div>

      </div>
    </section>
  );
}