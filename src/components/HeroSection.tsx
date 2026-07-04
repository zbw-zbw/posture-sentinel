"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSessions, getUnlockedAchievements } from "@/lib/storage";
import { ACHIEVEMENTS } from "@/lib/achievements";
import HeroDemo from "@/components/HeroDemo";

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
                a: Math.round(ease * targets.a),
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
    <section className="relative overflow-hidden py-20 md:py-24 px-4 md:px-6 bg-gradient-to-b from-primary-light/20 to-transparent">
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto">
        {/* Two-column hero: text left, demo right */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Main Title */}
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-tight">
              体态哨兵
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-text-secondary mt-4 max-w-lg mx-auto lg:mx-0">
              打开摄像头，AI 守护你的每一寸脊椎
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mt-8">
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
                className="inline-flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-alt text-text-primary font-medium px-7 py-3.5 rounded-xl transition-colors text-base"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                查看健康日报
              </Link>
            </div>

            {/* Keywords Row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6">
              <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">零成本</span>
              <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">零穿戴</span>
              <span className="border border-primary/30 text-primary rounded-full px-4 py-2 text-sm">零门槛</span>
            </div>
          </div>

          {/* Right: Interactive Demo (signature moment) */}
          <div className="flex-shrink-0">
            <HeroDemo />
          </div>
        </div>

        {/* Today Progress for returning users */}
        {todayProgress && (
          <Link
            href="/report"
            className="block mt-6 max-w-xl mx-auto bg-surface border border-border rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
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
          <div className="mt-6 max-w-xl mx-auto bg-surface border border-primary/20 rounded-2xl px-5 py-4 shadow-sm">
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

        {/* Stat Cards Row */}
        <div id="hero-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-primary tabular-nums">{counts.a}<span className="text-lg font-semibold ml-1">亿</span></p>
            <p className="text-sm text-text-secondary mt-1">中国颈椎病患者</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-warning tabular-nums">{counts.b}<span className="text-lg font-semibold ml-1">%</span></p>
            <p className="text-sm text-text-secondary mt-1">不到30岁的年轻人</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-border card-hover">
            <p className="text-3xl font-bold text-danger tabular-nums">{counts.c}<span className="text-lg font-semibold ml-1">小时</span></p>
            <p className="text-sm text-text-secondary mt-1">日均久坐时长</p>
          </div>
        </div>

      </div>
    </section>
  );
}