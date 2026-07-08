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

// Module-level cache for parsed sessions.
// A single DailyReport render may call getSessions() up to 7 times
// (weekly scores, yesterday report, hourly scores, week comparison, etc.).
// This cache ensures localStorage is parsed only once per cache lifetime;
// it is invalidated by any write (saveSession / importAllData / clearAllSessions /
// cleanupOldSessions) so stale reads are impossible.
let sessionsCache: SessionRecord[] | null = null;

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

export function saveSession(record: SessionRecord): boolean {
  const sessions = getSessions();
  const recordToSave = {
    ...record,
    scoreHistory: downsampleScoreHistory(record.scoreHistory),
  };
  sessions.push(recordToSave);

  // Try to save with progressive trimming if quota exceeded
  let toSave = sessions;
  const minSessions = 10; // keep at least the 10 most recent

  while (toSave.length > minSessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      sessionsCache = null;
      return true;
    } catch {
      // Quota exceeded — trim older sessions and retry
      toSave = toSave.slice(-Math.floor(toSave.length / 2));
    }
  }

  // Last resort: try saving just the minimum
  try {
    const minimal = sessions.slice(-minSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    sessionsCache = null;
    return true;
  } catch {
    // Even minimal save failed — localStorage is truly full
    sessionsCache = null;
    return false;
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
      // Storage changed — invalidate cache
      sessionsCache = null;
    }
  } catch {
    // ignore
  }
}

// Parse sessions directly from localStorage (bypassing the cache) and
// populate the cache. Returns a shallow copy so callers can mutate freely.
function parseFromStorage(): SessionRecord[] {
  if (typeof window === "undefined") {
    sessionsCache = [];
    return [...sessionsCache];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      sessionsCache = [];
      return [...sessionsCache];
    }
    const raw: SessionRecord[] = JSON.parse(data);
    // Migrate old session records that use pre-rename metric field names
    sessionsCache = raw.map(migrateSessionRecord);
    return [...sessionsCache];
  } catch {
    sessionsCache = [];
    return [...sessionsCache];
  }
}

export function getSessions(): SessionRecord[] {
  // Cache hit — return a copy so callers cannot mutate the cached array
  if (sessionsCache) return [...sessionsCache];
  return parseFromStorage();
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
  // Storage cleared — invalidate cache
  sessionsCache = null;
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
  // Settings are user-written JSON; they may be corrupted. Parse defensively
  // and fall back to null so export never crashes on a bad settings blob.
  let settings: unknown = null;
  if (settingsRaw) {
    try {
      settings = JSON.parse(settingsRaw);
    } catch {
      settings = null;
    }
  }
  return {
    version: 1,
    exportedAt: Date.now(),
    sessions: getSessions(),
    settings,
    baseline: getBaseline(),
    achievements: getUnlockedAchievements(),
    restSettings: getRestSettings(),
  };
}

// Validate the structure of imported data before writing it to localStorage.
// Throws an Error with a descriptive message if the data is malformed so the
// caller can surface it to the user instead of silently corrupting storage.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateImportData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("导入数据格式无效：缺少有效数据对象");
  }
  if (data.sessions !== undefined && data.sessions !== null) {
    if (!Array.isArray(data.sessions)) {
      throw new Error("导入数据格式无效：sessions 不是数组");
    }
    for (const s of data.sessions) {
      if (!s || typeof s !== "object") {
        throw new Error("导入数据格式无效：包含非对象的会话记录");
      }
      if (
        typeof s.id !== "string" ||
        typeof s.date !== "string" ||
        typeof s.startTime !== "number"
      ) {
        throw new Error("导入数据格式无效：会话缺少必要字段 (id, date, startTime)");
      }
    }
  }
}

export function importAllData(data: ExportData, mode: "overwrite" | "merge" = "overwrite"): { sessions: number; achievements: number } {
  // Validate structure before touching localStorage so malformed imports
  // are rejected cleanly instead of corrupting existing data.
  validateImportData(data);

  // Invalidate cache so merge-mode reads fresh data, and so post-import
  // reads reflect the newly written storage (invalidated again below).
  sessionsCache = null;
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
    // Storage changed — invalidate cache
    sessionsCache = null;
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

  // Storage changed — invalidate cache
  sessionsCache = null;
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
