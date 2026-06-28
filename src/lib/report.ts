import { getSessionsByDate, getSessions, type SessionRecord } from "./storage";

// Format a Date to YYYY-MM-DD using LOCAL time (not UTC)
function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DailyReportData {
  date: string;
  totalDuration: number;
  sessionCount: number;
  avgScore: number;
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  totalAlerts: number;
  avgMetrics: {
    headTilt: number;
    shoulderTilt: number;
    neckForward: number;
    spineTilt: number;
  };
  scoreTimeline: { time: number; score: number }[];
  sessions: SessionRecord[];
}

export interface WeeklyScore {
  date: string;
  dayName: string;
  score: number;
}

export function generateDailyReport(date: string): DailyReportData | null {
  const sessions = getSessionsByDate(date);
  if (sessions.length === 0) return null;

  let totalDuration = 0;
  let totalScore = 0;
  let totalAlerts = 0;
  let totalHeadTilt = 0;
  let totalShoulderTilt = 0;
  let totalNeckForward = 0;
  let totalSpineTilt = 0;
  let totalGood = 0;
  let totalWarning = 0;
  let totalBad = 0;
  const scoreTimeline: { time: number; score: number }[] = [];

  for (const s of sessions) {
    totalDuration += s.duration;
    totalScore += s.avgScore;
    totalAlerts += s.alertCount;
    totalHeadTilt += s.metrics.avgHeadTilt;
    totalShoulderTilt += s.metrics.avgShoulderTilt;
    totalNeckForward += s.metrics.avgNeckForward;
    totalSpineTilt += s.metrics.avgSpineTilt;
    totalGood += (s.goodPercent / 100) * s.duration;
    totalWarning += (s.warningPercent / 100) * s.duration;
    totalBad += (s.badPercent / 100) * s.duration;

    // Merge score histories
    if (s.scoreHistory && s.scoreHistory.length > 0) {
      scoreTimeline.push(...s.scoreHistory);
    }
  }

  const sessionCount = sessions.length;
  const avgScore = Math.round(totalScore / sessionCount);
  const totalPostureTime = totalGood + totalWarning + totalBad || 1;

  // Sort timeline by time
  scoreTimeline.sort((a, b) => a.time - b.time);

  return {
    date,
    totalDuration: Math.round(totalDuration / 60), // convert to minutes
    sessionCount,
    avgScore,
    goodPercent: Math.round((totalGood / totalPostureTime) * 100),
    warningPercent: Math.round((totalWarning / totalPostureTime) * 100),
    badPercent: Math.round((totalBad / totalPostureTime) * 100),
    totalAlerts,
    avgMetrics: {
      headTilt: Math.round((totalHeadTilt / sessionCount) * 10) / 10,
      shoulderTilt: Math.round((totalShoulderTilt / sessionCount) * 10) / 10,
      neckForward: Math.round((totalNeckForward / sessionCount) * 10) / 10,
      spineTilt: Math.round((totalSpineTilt / sessionCount) * 10) / 10,
    },
    scoreTimeline,
    sessions,
  };
}

export function getWeeklyScores(): WeeklyScore[] {
  const allSessions = getSessions();
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const result: WeeklyScore[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const daySessions = allSessions.filter((s) => s.date === dateStr);

    let score = 0;
    if (daySessions.length > 0) {
      const total = daySessions.reduce((sum, s) => sum + s.avgScore, 0);
      score = Math.round(total / daySessions.length);
    }

    result.push({
      date: dateStr,
      dayName: i === 0 ? "今天" : i === 1 ? "昨天" : dayNames[d.getDay()],
      score,
    });
  }

  return result;
}

export function getYesterdayReport(): DailyReportData | null {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = toLocalDateString(d);
  return generateDailyReport(yesterday);
}

export function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getFullYear()}年${month}月${day}日 ${dayNames[d.getDay()]}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toLocalDateString(new Date());
}

export function getAvailableDates(): string[] {
  const sessions = getSessions();
  const dates = new Set(sessions.map((s) => s.date));
  return Array.from(dates).sort().reverse();
}
