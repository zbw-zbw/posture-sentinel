"use client";
import { useSettings } from "@/hooks/useSettings";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementsCard from "@/components/settings/AchievementsCard";
import AchievementToast from "@/components/detect/AchievementToast";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions, getDailyGoalProgress } from "@/lib/storage";
import { computeAchievementStats, ACHIEVEMENTS } from "@/lib/achievements";

interface PageStats {
  totalSessions: number;
  totalHours: number;
  streakDays: number;
  bestScore: number;
  unlockedCount: number;
  totalAchievements: number;
}

export default function AchievementsPage() {
  const { settings } = useSettings();
  const achievements = useAchievements(settings.dailyGoalMinutes);
  const [stats, setStats] = useState<PageStats | null>(null);

  useEffect(() => {
    const t = setTimeout(() => achievements.checkAndUnlock(), 1000);
    return () => clearTimeout(t);
  }, [achievements]);

  useEffect(() => {
    try {
      const sessions = getSessions();
      const progress = getDailyGoalProgress(settings.dailyGoalMinutes);
      const achStats = computeAchievementStats(sessions, progress.streakDays, settings.dailyGoalMinutes);
      const totalDurationSec = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      setStats({
        totalSessions: sessions.length,
        totalHours: Math.round((totalDurationSec / 3600) * 10) / 10,
        streakDays: progress.streakDays,
        bestScore: achStats.bestScore,
        unlockedCount: achievements.unlocked.length,
        totalAchievements: ACHIEVEMENTS.length,
      });
    } catch {
      // ignore
    }
  }, [settings.dailyGoalMinutes, achievements.unlocked.length]);

  const isNewUser = stats && stats.totalSessions === 0;

  return (
    <div className="min-h-screen pb-12">
      <section className="bg-gradient-to-b from-primary-light/10 to-transparent px-4 md:px-6 pt-20 pb-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">成就徽章</h1>
              <p className="text-sm md:text-base text-text-secondary">通过持续检测解锁成就，保持健康坐姿习惯</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {stats && (
        <section className="px-4 md:px-6 mt-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-surface rounded-2xl p-4 text-center border border-border">
                <p className="text-xl font-bold text-primary tabular-nums">{stats.totalSessions}</p>
                <p className="text-xs text-text-muted mt-1">检测次数</p>
              </div>
              <div className="bg-surface rounded-2xl p-4 text-center border border-border">
                <p className="text-xl font-bold text-primary tabular-nums">{stats.totalHours}<span className="text-sm font-normal text-text-muted ml-0.5">h</span></p>
                <p className="text-xs text-text-muted mt-1">累计时长</p>
              </div>
              <div className="bg-surface rounded-2xl p-4 text-center border border-border">
                <p className="text-xl font-bold text-primary tabular-nums">{stats.streakDays}<span className="text-sm font-normal text-text-muted ml-0.5">天</span></p>
                <p className="text-xs text-text-muted mt-1">连续达标</p>
              </div>
              <div className="bg-surface rounded-2xl p-4 text-center border border-border">
                <p className="text-xl font-bold text-primary tabular-nums">{stats.bestScore}</p>
                <p className="text-xs text-text-muted mt-1">最高评分</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Progress bar */}
      {stats && !isNewUser && (
        <section className="px-4 md:px-6 mt-4">
          <div className="max-w-[1100px] mx-auto">
            <div className="bg-surface rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">成就完成度</span>
                <span className="text-sm font-bold text-primary">{stats.unlockedCount} / {stats.totalAchievements}</span>
              </div>
              <div className="bg-surface-alt rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700 ease-out"
                  style={{ width: `${(stats.unlockedCount / stats.totalAchievements) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New user guidance */}
      {isNewUser && (
        <section className="px-4 md:px-6 mt-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="bg-primary-light rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/60 flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">开始你的第一个成就</h3>
              <p className="text-sm text-text-secondary mb-4">
                完成第一次坐姿检测即可解锁&ldquo;初次启程&rdquo;徽章
              </p>
              <Link
                href="/detect"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                立即开始检测
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Achievements Grid */}
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-[1100px] mx-auto">
          <AchievementsCard unlocked={achievements.unlocked} />
        </div>
      </section>
      <AchievementToast achievement={achievements.newlyUnlocked} onDismiss={achievements.dismissToast} />
    </div>
  );
}
