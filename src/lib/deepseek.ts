export interface AdviceRequest {
  avgScore: number;
  goodPercent: number;
  warningPercent: number;
  badPercent: number;
  avgHeadAngle: number;
  avgShoulderSymmetry: number;
  avgSpineAngle: number;
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

    const json = await res.json();
    if (Array.isArray(json.advice) && json.advice.length > 0) {
      return json.advice;
    }
    return FALLBACK_ADVICE;
  } catch {
    return FALLBACK_ADVICE;
  }
}
