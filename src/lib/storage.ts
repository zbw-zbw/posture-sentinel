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
    avgHeadTilt: number;
    avgShoulderTilt: number;
    avgNeckForward: number;
    avgSpineTilt: number;
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
    if (!data) return [];
    const raw: SessionRecord[] = JSON.parse(data);
    // Migrate old session records that use pre-rename metric field names
    return raw.map(migrateSessionRecord);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSessionRecord(s: any): SessionRecord {
  const m = s.metrics || {};
  return {
    ...s,
    metrics: {
      avgHeadTilt: m.avgHeadTilt ?? m.avgHeadAngle ?? 0,
      avgShoulderTilt: m.avgShoulderTilt ?? m.avgShoulderSymmetry ?? 0,
      avgNeckForward: m.avgNeckForward ?? 0,
      avgSpineTilt: m.avgSpineTilt ?? m.avgSpineAngle ?? 0,
    },
  };
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

export interface DailyGoalProgress {
  todayMinutes: number;        // 今日已检测分钟数
  goalMinutes: number;         // 目标分钟数
  percent: number;             // 完成百分比 0-100
  isCompleted: boolean;        // 今日是否达标
  streakDays: number;         // 连续达标天数
  streakLabel: string;        // 如 "连续 3 天达标"
}

// ── Baseline (personal posture calibration) ──

export interface PostureBaseline {
  headTilt: number;
  shoulderTilt: number;
  neckForward: number;
  spineTilt: number;
  capturedAt: number;
}

const BASELINE_KEY = "posture-sentinel:baseline";

export function getBaseline(): PostureBaseline | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(BASELINE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveBaseline(baseline: PostureBaseline): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
  } catch {
    // ignore
  }
}

export function clearBaseline(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BASELINE_KEY);
}

// ── Achievements ──

const ACHIEVEMENTS_KEY = "posture-sentinel:achievements";

export function getUnlockedAchievements(): { id: string; unlockedAt: number }[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUnlockedAchievements(list: { id: string; unlockedAt: number }[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// ── Rest reminder settings ──

export interface RestReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 15/30/45/60
  restDurationMinutes: number; // 1-5
  showStretchGuide: boolean;
}

export const DEFAULT_REST_SETTINGS: RestReminderSettings = {
  enabled: false,
  intervalMinutes: 30,
  restDurationMinutes: 2,
  showStretchGuide: true,
};

const REST_SETTINGS_KEY = "posture-sentinel:rest-settings";

export function getRestSettings(): RestReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REST_SETTINGS;
  try {
    const data = localStorage.getItem(REST_SETTINGS_KEY);
    return data ? { ...DEFAULT_REST_SETTINGS, ...JSON.parse(data) } : DEFAULT_REST_SETTINGS;
  } catch {
    return DEFAULT_REST_SETTINGS;
  }
}

export function saveRestSettings(settings: RestReminderSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REST_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// ── Data export / import ──

export interface ExportData {
  version: number;
  exportedAt: number;
  sessions: SessionRecord[];
  settings: unknown;
  baseline: PostureBaseline | null;
  achievements: { id: string; unlockedAt: number }[];
  restSettings: RestReminderSettings;
}

export function exportAllData(): ExportData {
  const settingsRaw = localStorage.getItem(SETTINGS_KEY);
  return {
    version: 1,
    exportedAt: Date.now(),
    sessions: getSessions(),
    settings: settingsRaw ? JSON.parse(settingsRaw) : null,
    baseline: getBaseline(),
    achievements: getUnlockedAchievements(),
    restSettings: getRestSettings(),
  };
}

export function importAllData(data: ExportData, mode: "overwrite" | "merge" = "overwrite"): { sessions: number; achievements: number } {
  if (mode === "overwrite") {
    // Clear and replace all
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sessions));
    }
    if (data.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    }
    if (data.baseline) {
      localStorage.setItem(BASELINE_KEY, JSON.stringify(data.baseline));
    } else {
      localStorage.removeItem(BASELINE_KEY);
    }
    if (data.achievements) {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data.achievements));
    }
    if (data.restSettings) {
      localStorage.setItem(REST_SETTINGS_KEY, JSON.stringify(data.restSettings));
    }
    return {
      sessions: data.sessions?.length || 0,
      achievements: data.achievements?.length || 0,
    };
  }

  // Merge mode: deduplicate sessions by ID, merge achievements
  const existingSessions = getSessions();
  const existingIds = new Set(existingSessions.map((s) => s.id));
  const mergedSessions = [...existingSessions];
  let newSessionCount = 0;
  for (const s of data.sessions || []) {
    if (!existingIds.has(s.id)) {
      mergedSessions.push(s);
      newSessionCount++;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSessions));

  // Merge achievements
  const existingAchievements = getUnlockedAchievements();
  const existingAchIds = new Set(existingAchievements.map((a) => a.id));
  const mergedAchievements = [...existingAchievements];
  let newAchCount = 0;
  for (const a of data.achievements || []) {
    if (!existingAchIds.has(a.id)) {
      mergedAchievements.push(a);
      newAchCount++;
    }
  }
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(mergedAchievements));

  // For settings/baseline/restSettings, only import if not already set
  if (data.settings && !localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
  }
  if (data.baseline && !getBaseline()) {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(data.baseline));
  }
  if (data.restSettings && !localStorage.getItem(REST_SETTINGS_KEY)) {
    localStorage.setItem(REST_SETTINGS_KEY, JSON.stringify(data.restSettings));
  }

  return { sessions: newSessionCount, achievements: newAchCount };
}

export function getDailyGoalProgress(goalMinutes: number): DailyGoalProgress {
  const today = getTodayDate();
  const sessions = getSessions();

  // 计算今日总检测时长（秒 → 分钟）
  const todaySessions = sessions.filter(s => s.date === today);
  const todaySeconds = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const todayMinutes = Math.round(todaySeconds / 60);

  const percent = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;
  const isCompleted = todayMinutes >= goalMinutes;

  // 计算连续达标天数（从今天往回数）
  let streakDays = 0;
  if (isCompleted) {
    streakDays = 1;
    // 往前一天一天检查
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dateStr = toLocalDateString(checkDate);
      const daySessions = sessions.filter(s => s.date === dateStr);
      const dayMinutes = Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
      if (dayMinutes >= goalMinutes) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      // 最多查 365 天
      if (streakDays >= 365) break;
    }
  }

  return {
    todayMinutes,
    goalMinutes,
    percent,
    isCompleted,
    streakDays,
    streakLabel: streakDays > 0 ? `连续 ${streakDays} 天达标` : "今日尚未达标",
  };
}
