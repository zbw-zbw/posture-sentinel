export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  /** Check if this achievement is unlocked given current stats */
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalSessions: number;
  totalDurationSec: number; // cumulative seconds
  streakDays: number;
  bestScore: number; // best single-day avg score
  earliestSessionHour: number | null; // 0-23, earliest hour a session was started
  goalMinutes: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // timestamp
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_session",
    name: "初次启程",
    description: "完成第一次坐姿检测",
    icon: "🚀",
    check: (s) => s.totalSessions >= 1,
  },
  {
    id: "streak_3",
    name: "三日连击",
    description: "连续 3 天达到每日目标",
    icon: "🔥",
    check: (s) => s.streakDays >= 3,
  },
  {
    id: "streak_7",
    name: "周而复始",
    description: "连续 7 天达到每日目标",
    icon: "⭐",
    check: (s) => s.streakDays >= 7,
  },
  {
    id: "streak_30",
    name: "月度冠军",
    description: "连续 30 天达到每日目标",
    icon: "🏆",
    check: (s) => s.streakDays >= 30,
  },
  {
    id: "total_hours_10",
    name: "累计 10 小时",
    description: "累计检测时长达到 10 小时",
    icon: "⏱️",
    check: (s) => s.totalDurationSec >= 10 * 3600,
  },
  {
    id: "total_hours_50",
    name: "资深守护",
    description: "累计检测时长达到 50 小时",
    icon: "🛡️",
    check: (s) => s.totalDurationSec >= 50 * 3600,
  },
  {
    id: "perfect_day",
    name: "完美一天",
    description: "某天平均评分达到 90 分以上",
    icon: "✨",
    check: (s) => s.bestScore >= 90,
  },
  {
    id: "early_bird",
    name: "早起的鸟儿",
    description: "在早上 9 点前开始检测",
    icon: "🌅",
    check: (s) => s.earliestSessionHour !== null && s.earliestSessionHour < 9,
  },
];

/** Compute achievement stats from session records + daily goal progress */
export function computeAchievementStats(
  sessions: { startTime: number; duration: number; avgScore: number; date: string }[],
  streakDays: number,
  goalMinutes: number
): AchievementStats {
  const totalSessions = sessions.length;
  const totalDurationSec = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Best single-day average score
  const dayScores = new Map<string, { total: number; count: number }>();
  for (const s of sessions) {
    const entry = dayScores.get(s.date) || { total: 0, count: 0 };
    entry.total += s.avgScore;
    entry.count += 1;
    dayScores.set(s.date, entry);
  }
  let bestScore = 0;
  for (const { total, count } of dayScores.values()) {
    const avg = count > 0 ? total / count : 0;
    if (avg > bestScore) bestScore = avg;
  }

  // Earliest session start hour
  let earliestSessionHour: number | null = null;
  for (const s of sessions) {
    const hour = new Date(s.startTime).getHours();
    if (earliestSessionHour === null || hour < earliestSessionHour) {
      earliestSessionHour = hour;
    }
  }

  return {
    totalSessions,
    totalDurationSec,
    streakDays,
    bestScore: Math.round(bestScore),
    earliestSessionHour,
    goalMinutes,
  };
}

/** Check which new achievements should be unlocked */
export function checkNewAchievements(
  stats: AchievementStats,
  alreadyUnlocked: Set<string>
): AchievementDef[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.has(a.id) && a.check(stats)
  );
}
