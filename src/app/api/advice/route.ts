import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    avgScore,
    goodPercent,
    warningPercent,
    badPercent,
    avgHeadAngle,
    avgShoulderSymmetry,
    avgSpineAngle,
    alertCount,
    totalDuration,
    sessionCount,
  } = body;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { advice: ["未配置 DeepSeek API Key，请联系管理员。"] },
      { status: 200 }
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

  const userPrompt = `今日坐姿检测数据：
- 综合评分：${avgScore}/100
- 良好坐姿占比：${goodPercent}%
- 需要注意占比：${warningPercent}%
- 坐姿不良占比：${badPercent}%
- 平均头前倾角度：${avgHeadAngle}°（正常<15°）
- 平均肩膀对称度：${avgShoulderSymmetry}%（正常>85%）
- 平均脊椎弧度：${avgSpineAngle}°（正常<20°）
- 今日提醒次数：${alertCount}次
- 总检测时长：${totalDuration}分钟
- 检测次数：${sessionCount}次

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
      await res.text();
      return NextResponse.json({ advice: ["AI 服务暂时不可用，请稍后重试。"] }, { status: 200 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

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

    if (advice.length === 0) {
      advice = ["AI 分析暂时不可用，建议多关注坐姿，定时起身活动。"];
    }

    return NextResponse.json({ advice });
  } catch {
    return NextResponse.json({ advice: ["网络错误，请检查网络连接后重试。"] }, { status: 200 });
  }
}
