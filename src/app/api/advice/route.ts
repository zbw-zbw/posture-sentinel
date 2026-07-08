import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per-IP, sliding window)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Sanitize and validate numeric inputs to prevent prompt injection
function sanitizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { advice: ["请求过于频繁，请稍后再试。"] },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { advice: ["请求格式错误，请检查提交的数据。"] },
      { status: 400 }
    );
  }

  // Validate and sanitize all inputs — clamp to valid ranges
  const avgScore = sanitizeNumber(body.avgScore, 0, 100, 50);
  const goodPercent = sanitizeNumber(body.goodPercent, 0, 100, 0);
  const warningPercent = sanitizeNumber(body.warningPercent, 0, 100, 0);
  const badPercent = sanitizeNumber(body.badPercent, 0, 100, 0);
  const avgHeadTilt = sanitizeNumber(body.avgHeadTilt, 0, 90, 0);
  const avgShoulderTilt = sanitizeNumber(body.avgShoulderTilt, 0, 90, 0);
  const avgNeckForward = sanitizeNumber(body.avgNeckForward, 0, 100, 0);
  const avgSpineTilt = sanitizeNumber(body.avgSpineTilt, 0, 90, 0);
  const alertCount = sanitizeNumber(body.alertCount, 0, 9999, 0);
  const totalDuration = sanitizeNumber(body.totalDuration, 0, 1440, 0); // max 24h in minutes
  const sessionCount = sanitizeNumber(body.sessionCount, 1, 999, 1);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { advice: ["未配置 AI 服务，暂不可用。"] },
      { status: 503 }
    );
  }

  const systemPrompt = `你是一个专业的脊椎健康顾问，专注于坐姿改善指导。用户使用"体态哨兵"工具检测了今日的坐姿数据，请根据数据给出3-5条个性化、可操作的改善建议。

要求：
1. 建议要具体可执行，不要泛泛而谈
2. 根据用户的薄弱指标重点给出建议
3. 语气温和鼓励，不要批评
4. 每条建议控制在30字以内
5. 可以包含简单的拉伸动作建议
6. 直接返回 JSON 数组格式：["建议1", "建议2", ...]`;

  // All values are sanitized numbers — safe to interpolate
  const userPrompt = `今日坐姿检测数据：
- 综合评分：${avgScore.toFixed(0)}/100
- 良好坐姿占比：${goodPercent.toFixed(0)}%
- 需要注意占比：${warningPercent.toFixed(0)}%
- 坐姿不良占比：${badPercent.toFixed(0)}%
- 平均头部倾斜：${avgHeadTilt.toFixed(1)}°（正常<5°）
- 平均肩膀倾斜：${avgShoulderTilt.toFixed(1)}°（正常<3°）
- 平均脖子前倾程度：${avgNeckForward.toFixed(0)}%（正常<30%）
- 平均脊椎倾斜：${avgSpineTilt.toFixed(1)}°（正常<5°）
- 今日提醒次数：${alertCount.toFixed(0)}次
- 总检测时长：${totalDuration.toFixed(0)}分钟
- 检测次数：${sessionCount.toFixed(0)}次

请给出个性化改善建议。`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { advice: ["AI 服务暂时不可用，请稍后重试。"] },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON array
    let advice: string[] = [];
    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        advice = JSON.parse(match[0]);
      }
    } catch {
      // Fallback: extract quoted strings
      const matches = content.match(/"([^"]+)"/g);
      if (matches) {
        advice = matches.map((m: string) => m.replace(/"/g, ""));
      }
    }

    // Sanitize each advice string: limit length, strip dangerous content
    advice = advice
      .filter((s) => typeof s === "string" && s.length > 0 && s.length < 200)
      .slice(0, 6)
      .map((s) => s.trim());

    if (advice.length === 0) {
      advice = ["AI 分析暂时不可用，建议多关注坐姿，定时起身活动。"];
    }

    return NextResponse.json({ advice });
  } catch {
    return NextResponse.json(
      { advice: ["网络错误，请检查网络连接后重试。"] },
      { status: 500 }
    );
  }
}
