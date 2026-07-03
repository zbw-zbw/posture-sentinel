"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSessions, getUnlockedAchievements } from "@/lib/storage";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function HeroSection() {
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0 });
  const countedRef = useRef(false);
  const [todayProgress, setTodayProgress] = useState<{ minutes: number; sessions: number } | null | undefined>(undefined);
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    try {
      const sessions = getSessions();
      const today = new Date().toISOString().split("T")[0];
      const todaySessions = sessions.filter(s => s.date === today);
      const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
      if (todayMinutes > 0) {
        setTodayProgress({ minutes: todayMinutes, sessions: todaySessions.length });
      } else {
        setTodayProgress(null);
      }
      // Load achievement count
      const unlocked = getUnlockedAchievements();
      setAchievementCount(unlocked.length);
    } catch {
      // ignore
    }
  }, []);

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
    <section className="relative overflow-hidden py-24 px-4 md:px-6 text-center bg-gradient-to-b from-primary-light/20 to-transparent">
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

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

      <div className="relative z-10 max-w-[1100px] mx-auto">
        {/* Main Title */}
        <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold text-text-primary mt-6">
          体态哨兵
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary mt-4">
          打开摄像头，AI 守护你的每一寸脊椎
        </p>

        {/* Today Progress for returning users */}
        {todayProgress && (
          <Link
            href="/report"
            className="block mt-6 max-w-xl mx-auto bg-white border border-border rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-text-primary">
                  今日已检测 {todayProgress.minutes} 分钟 · {todayProgress.sessions} 次会话
                </p>
                <p className="text-xs text-text-muted mt-0.5 group-hover:text-primary transition-colors">
                  点击查看今日完整报告 →
                </p>
              </div>
              {achievementCount > 0 && (
                <div className="flex items-center gap-1 bg-primary-light px-2.5 py-1 rounded-lg flex-shrink-0">
                  <span className="text-xs">🏆</span>
                  <span className="text-xs font-semibold text-primary">{achievementCount} / {ACHIEVEMENTS.length}</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* New user quick-start guide */}
        {todayProgress === null && (
          <div className="mt-6 max-w-xl mx-auto bg-white border border-primary/20 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <p className="text-sm font-semibold text-text-primary">快速上手 3 步</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                <p className="text-xs text-text-secondary leading-snug">点击&ldquo;开始检测&rdquo;打开摄像头</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                <p className="text-xs text-text-secondary leading-snug">保持坐姿，AI 实时分析体态</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                <p className="text-xs text-text-secondary leading-snug">查看报告，持续改善坐姿</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <Link
            href="/detect"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            立即开始检测
          </Link>
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-2 bg-white border border-border hover:bg-surface-alt text-text-primary font-medium px-7 py-3.5 rounded-xl transition-colors text-base"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            查看健康日报
          </Link>
        </div>

        {/* Stat Cards Row */}
        <div id="hero-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
          {/* Card 1 - Green */}
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-primary tabular-nums">{counts.a}<span className="text-lg font-semibold ml-1">亿</span></p>
            <p className="text-sm text-text-secondary mt-1">中国颈椎病患者</p>
          </div>

          {/* Card 2 - Orange */}
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-warning tabular-nums">{counts.b}<span className="text-lg font-semibold ml-1">%</span></p>
            <p className="text-sm text-text-secondary mt-1">不到30岁的年轻人</p>
          </div>

          {/* Card 3 - Red */}
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-danger tabular-nums">{counts.c}<span className="text-lg font-semibold ml-1">小时</span></p>
            <p className="text-sm text-text-secondary mt-1">日均久坐时长</p>
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