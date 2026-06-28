export interface SessionRecord {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  duration: number;
  avgScore: number;
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  alertCount: number;
  scoreHistory: { time: number; score: number }[];
  metrics: {
    avgHeadAngle: number;
    avgShoulderSymmetry: number;
    avgSpineAngle: number;
  };
}

const STORAGE_KEY = "posture-sentinel-sessions";
const SETTINGS_KEY = "posture-sentinel-settings";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Format a Date to YYYY-MM-DD using LOCAL time (not UTC)
// Avoids timezone shift bugs when using toISOString()
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDate(): string {
  return toLocalDateString(new Date());
}

function downsampleScoreHistory(history: { time: number; score: number }[]): { time: number; score: number }[] {
  if (history.length <= 200) return history;
  const step = Math.ceil(history.length / 200);
  return history.filter((_, i) => i % step === 0);
}

export function saveSession(record: SessionRecord): void {
  const sessions = getSessions();
  const recordToSave = {
    ...record,
    scoreHistory: downsampleScoreHistory(record.scoreHistory),
  };
  sessions.push(recordToSave);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage full - remove oldest sessions
    const trimmed = sessions.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

export function cleanupOldSessions(days = 30): void {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sessions: SessionRecord[] = data ? JSON.parse(data) : [];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = sessions.filter((s) => s.startTime > cutoff);
    if (filtered.length < sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }
}

export function getSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSessionsByDate(date: string): SessionRecord[] {
  return getSessions().filter((s) => s.date === date);
}

export function getTodaySessions(): SessionRecord[] {
  const today = getTodayDate();
  return getSessionsByDate(today);
}

export function clearAllSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveSettings(settings: any): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail
  }
}

export function loadSettings<T>(defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch {
    return defaults;
  }
}
