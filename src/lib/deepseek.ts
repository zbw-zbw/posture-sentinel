export interface AdviceRequest {
  avgScore: number;
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  avgHeadTilt: number;
  avgShoulderTilt: number;
  avgNeckForward: number;
  avgSpineTilt: number;
  alertCount: number;
  totalDuration: number;
  sessionCount: number;
}

export interface AdviceResponse {
  advice: string[];
}

const FALLBACK_ADVICE = [
  "保持屏幕与眼睛平齐，避免长时间低头看手机或电脑。",
  "每工作30分钟起身活动一下，做几个简单的肩部拉伸动作。",
  "检查座椅高度，确保双脚平放地面，膝盖呈90度角。",
];

function normalizeAdvice(raw: unknown): string[] {
  // 已经是字符串数组
  if (Array.isArray(raw)) {
    const strings = raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (strings.length > 0) return strings;
  }

  // 某些 API 可能直接返回字符串
  if (typeof raw === "string" && raw.trim().length > 0) {
    return [raw.trim()];
  }

  // 尝试从对象字段提取
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["advice", "suggestions", "tips", "data"]) {
      const value = obj[key];
      if (Array.isArray(value)) {
        const strings = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        if (strings.length > 0) return strings;
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return [value.trim()];
      }
    }
  }

  return FALLBACK_ADVICE;
}

export async function fetchAdvice(data: AdviceRequest): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Unexpected response type: ${contentType}`);
    }

    const json = await res.json();
    return normalizeAdvice(json);
  } catch {
    return FALLBACK_ADVICE;
  }
}
