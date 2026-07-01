"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  getSessions,
  getUnlockedAchievements,
  saveUnlockedAchievements,
  getDailyGoalProgress,
} from "@/lib/storage";
import {
  ACHIEVEMENTS,
  computeAchievementStats,
  checkNewAchievements,
  type AchievementDef,
  type UnlockedAchievement,
} from "@/lib/achievements";

export function useAchievements(goalMinutes: number) {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDef | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
  }, []);

  const checkAndUnlock = useCallback(() => {
    // Debounce to avoid rapid repeated checks
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => {
      const sessions = getSessions();
      const progress = getDailyGoalProgress(goalMinutes);
      const stats = computeAchievementStats(sessions, progress.streakDays, goalMinutes);
      const alreadyUnlocked = new Set(getUnlockedAchievements().map((a) => a.id));
      const newOnes = checkNewAchievements(stats, alreadyUnlocked);

      if (newOnes.length > 0) {
        const now = Date.now();
        const newEntries: UnlockedAchievement[] = newOnes.map((a) => ({
          id: a.id,
          unlockedAt: now,
        }));
        const allUnlocked = [...getUnlockedAchievements(), ...newEntries];
        saveUnlockedAchievements(allUnlocked);
        setUnlocked(allUnlocked);

        // Show toast for the first new achievement
        setNewlyUnlocked(newOnes[0]);
      }
    }, 500);
  }, [goalMinutes]);

  const dismissToast = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return {
    unlocked,
    unlockedCount,
    totalCount,
    newlyUnlocked,
    dismissToast,
    checkAndUnlock,
  };
}
