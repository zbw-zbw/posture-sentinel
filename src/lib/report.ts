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
    totalDuration += s.duration || 0;
    totalScore += s.avgScore || 0;
    totalAlerts += s.alertCount || 0;
    totalHeadTilt += s.metrics?.avgHeadTilt ?? 0;
    totalShoulderTilt += s.metrics?.avgShoulderTilt ?? 0;
    totalNeckForward += s.metrics?.avgNeckForward ?? 0;
    totalSpineTilt += s.metrics?.avgSpineTilt ?? 0;
    totalGood += ((s.goodPercent || 0) / 100) * (s.duration || 0);
    totalWarning += ((s.warningPercent || 0) / 100) * (s.duration || 0);
    totalBad += ((s.badPercent || 0) / 100) * (s.duration || 0);

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
      // Only count sessions with non-zero scores (filter out old broken sessions)
      const validSessions = daySessions.filter((s) => s.avgScore > 0);
      if (validSessions.length > 0) {
        const total = validSessions.reduce((sum, s) => sum + s.avgScore, 0);
        score = Math.round(total / validSessions.length);
      }
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

// Hourly posture distribution: aggregate all sessions by hour-of-day
export interface HourlyScore {
  hour: number;
  avgScore: number;
  sessionCount: number;
  label: string;
}

export function getHourlyScores(): HourlyScore[] {
  const sessions = getSessions();
  const buckets: Record<number, { totalScore: number; count: number }> = {};

  for (const s of sessions) {
    if (!s.startTime || !s.avgScore) continue;
    const hour = new Date(s.startTime).getHours();
    if (!buckets[hour]) buckets[hour] = { totalScore: 0, count: 0 };
    buckets[hour].totalScore += s.avgScore;
    buckets[hour].count += 1;
  }

  const result: HourlyScore[] = [];
  for (let h = 0; h < 24; h++) {
    if (buckets[h]) {
      result.push({
        hour: h,
        avgScore: Math.round(buckets[h].totalScore / buckets[h].count),
        sessionCount: buckets[h].count,
        label: `${String(h).padStart(2, "0")}:00`,
      });
    }
  }
  return result;
}

// Week-over-week comparison
export interface WeekComparison {
  thisWeekAvg: number;
  lastWeekAvg: number;
  scoreDelta: number;
  thisWeekSessions: number;
  lastWeekSessions: number;
  sessionDelta: number;
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  minutesDelta: number;
}

export function getWeekComparison(): WeekComparison {
  const allSessions = getSessions();
  const now = new Date();

  // This week: last 7 days
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 6);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Last week: 7-14 days ago
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(now.getDate() - 7);
  lastWeekEnd.setHours(23, 59, 59, 999);

  const thisWeekSessions = allSessions.filter(s => {
    const d = new Date(s.date + "T00:00:00");
    return d >= thisWeekStart;
  });
  const lastWeekSessions = allSessions.filter(s => {
    const d = new Date(s.date + "T00:00:00");
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  const calcAvg = (sessions: SessionRecord[]) => {
    const valid = sessions.filter(s => s.avgScore > 0);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((sum, s) => sum + s.avgScore, 0) / valid.length);
  };
  const calcMinutes = (sessions: SessionRecord[]) =>
    Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);

  const thisWeekAvg = calcAvg(thisWeekSessions);
  const lastWeekAvg = calcAvg(lastWeekSessions);
  const thisWeekMinutes = calcMinutes(thisWeekSessions);
  const lastWeekMinutes = calcMinutes(lastWeekSessions);

  return {
    thisWeekAvg,
    lastWeekAvg,
    scoreDelta: thisWeekAvg - lastWeekAvg,
    thisWeekSessions: thisWeekSessions.length,
    lastWeekSessions: lastWeekSessions.length,
    sessionDelta: thisWeekSessions.length - lastWeekSessions.length,
    thisWeekMinutes,
    lastWeekMinutes,
    minutesDelta: thisWeekMinutes - lastWeekMinutes,
  };
}

// Monthly calendar heatmap: daily avg scores for a given month
export interface CalendarDayData {
  date: string;       // YYYY-MM-DD
  day: number;        // 1-31
  score: number;      // avg score (0 if no sessions)
  sessionCount: number;
  duration: number;   // in minutes
  isToday: boolean;
  isFuture: boolean;
}

export interface MonthCalendarData {
  year: number;
  month: number;      // 0-11
  monthName: string;
  days: CalendarDayData[];      // all days in the month (1..31)
  firstDayOfWeek: number;       // 0=Sunday, for grid offset
  avgScore: number;
  totalSessions: number;
  totalMinutes: number;
  activeDays: number;
}

export function getMonthCalendar(year: number, month: number): MonthCalendarData {
  const allSessions = getSessions();
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ];
  const todayStr = toLocalDateString(new Date());

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  const days: CalendarDayData[] = [];
  let totalScore = 0;
  let totalSessions = 0;
  let totalMinutes = 0;
  let activeDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toLocalDateString(new Date(year, month, d));
    const daySessions = allSessions.filter(s => s.date === dateStr);
    const validSessions = daySessions.filter(s => s.avgScore > 0);

    const score = validSessions.length > 0
      ? Math.round(validSessions.reduce((sum, s) => sum + s.avgScore, 0) / validSessions.length)
      : 0;
    const duration = Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const isFuture = new Date(year, month, d) > new Date();

    if (daySessions.length > 0) {
      totalSessions += daySessions.length;
      totalMinutes += duration;
      if (score > 0) {
        totalScore += score;
        activeDays++;
      }
    }

    days.push({
      date: dateStr,
      day: d,
      score,
      sessionCount: daySessions.length,
      duration,
      isToday: dateStr === todayStr,
      isFuture,
    });
  }

  return {
    year,
    month,
    monthName: monthNames[month],
    days,
    firstDayOfWeek,
    avgScore: activeDays > 0 ? Math.round(totalScore / activeDays) : 0,
    totalSessions,
    totalMinutes,
    activeDays,
  };
}
