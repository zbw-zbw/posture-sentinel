"use client";
import { useSettings } from "@/hooks/useSettings";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementsCard from "@/components/settings/AchievementsCard";
import AchievementToast from "@/components/detect/AchievementToast";
import { useEffect } from "react";
import Link from "next/link";

export default function AchievementsPage() {
  const { settings } = useSettings();
  const achievements = useAchievements(settings.dailyGoalMinutes);

  useEffect(() => {
    const t = setTimeout(() => achievements.checkAndUnlock(), 1000);
    return () => clearTimeout(t);
  }, [achievements]);

  return (
    <div className="min-h-screen pb-10">
      <section className="bg-gradient-to-b from-primary-light/10 to-transparent px-4 md:px-6 pt-20 pb-8">
        <div className="max-w-3xl mx-auto">
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
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-3xl mx-auto">
          <AchievementsCard unlocked={achievements.unlocked} />
        </div>
      </section>
      <AchievementToast achievement={achievements.newlyUnlocked} onDismiss={achievements.dismissToast} />
    </div>
  );
}
