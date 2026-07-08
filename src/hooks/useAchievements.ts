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
  // Queue of remaining newly-unlocked achievements waiting to be toasted.
  // `newlyUnlocked` holds only the currently-displayed achievement; the rest
  // live here and are surfaced one-by-one as each toast is dismissed. This
  // avoids losing achievements when several unlock at the same time.
  const pendingNewRef = useRef<AchievementDef[]>([]);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
  }, []);

  const checkAndUnlock = useCallback(() => {
    // Debounce to avoid rapid repeated checks
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => {
      try {
        const sessions = getSessions();
        const progress = getDailyGoalProgress(goalMinutes);
        const stats = computeAchievementStats(sessions, progress.streakDays, goalMinutes);
        const alreadyUnlocked = new Set(getUnlockedAchievements().map((a) => a.id));
        const newOnes = checkNewAchievements(stats, alreadyUnlocked);

        if (newOnes.length > 0) {
          // Guard against TOCTOU (multi-tab race): re-read the unlocked list
          // right before saving. Another tab may have unlocked the same
          // achievements between our initial read above and this write, so we
          // filter out anything that is now already unlocked.
          const latestUnlocked = getUnlockedAchievements();
          const latestIds = new Set(latestUnlocked.map((a) => a.id));
          const trulyNew = newOnes.filter((a) => !latestIds.has(a.id));

          if (trulyNew.length > 0) {
            const now = Date.now();
            const newEntries: UnlockedAchievement[] = trulyNew.map((a) => ({
              id: a.id,
              unlockedAt: now,
            }));
            const allUnlocked = [...latestUnlocked, ...newEntries];
            saveUnlockedAchievements(allUnlocked);
            setUnlocked(allUnlocked);

            // Show all newly unlocked achievements, not just the first one.
            // Display the first immediately and queue the rest; each is
            // surfaced one-by-one as the previous toast is dismissed.
            pendingNewRef.current = trulyNew.slice(1);
            setNewlyUnlocked(trulyNew[0]);
          }
        }
      } catch {
        // Best effort — if achievement checking fails, silently ignore so a
        // storage error never crashes the detection flow.
      }
    }, 500);
  }, [goalMinutes]);

  const dismissToast = useCallback(() => {
    // If there are more newly-unlocked achievements queued, show the next one
    // instead of clearing the toast entirely.
    if (pendingNewRef.current.length > 0) {
      const [next, ...rest] = pendingNewRef.current;
      pendingNewRef.current = rest;
      setNewlyUnlocked(next);
    } else {
      setNewlyUnlocked(null);
    }
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
