"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAdvice } from "@/lib/deepseek";
import type { AdviceRequest } from "@/lib/deepseek";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CacheEntry {
  text: string;
  timestamp: number;
}

function getCachedAdvice(date: string): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`posture-advice-${date}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(`posture-advice-${date}`);
      return null;
    }
    return JSON.parse(entry.text) as string[];
  } catch {
    return null;
  }
}

function setCachedAdvice(date: string, advice: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = {
      text: JSON.stringify(advice),
      timestamp: Date.now(),
    };
    localStorage.setItem(`posture-advice-${date}`, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable — silently ignore
  }
}

interface AIAdviceProps {
  data: AdviceRequest;
  date: string;
}

function generateLocalAdvice(report: { avgScore: number }): string[] {
  const advice: string[] = [];
  if (report.avgScore >= 80) {
    advice.push("今天的坐姿表现不错！继续保持挺直腰背的好习惯。");
    advice.push("每隔 45 分钟站起来活动 2-3 分钟，做做拉伸。");
    advice.push("保持显示器与眼睛齐平，避免低头看屏幕。");
  } else if (report.avgScore >= 60) {
    advice.push("坐姿整体还行，但仍有提升空间。注意保持肩膀放松下沉。");
    advice.push("试试把椅子调高一点，让双脚能平放地面。");
    advice.push("每 30 分钟提醒自己检查一次坐姿。");
  } else {
    advice.push("今天的坐姿需要多加注意。建议调整工作环境，让正确坐姿更自然。");
    advice.push("显示器上移到与视线平齐的位置，减少低头。");
    advice.push("考虑使用有腰部支撑的椅子，帮助保持腰椎自然弯曲。");
    advice.push("每坐 20 分钟就站起来走动一下，避免长时间保持同一姿势。");
  }
  return advice;
}

export default function AIAdvice({ data, date }: AIAdviceProps) {
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalAdvice, setIsLocalAdvice] = useState(false);
  
  const load = useCallback(async (useCache = true) => {
    setLoading(true);
    setIsLocalAdvice(false);

    // 1. Check localStorage cache
    if (useCache) {
      const cached = getCachedAdvice(date);
      if (cached) {
        setAdvice(cached);
        setLoading(false);
        return;
      }
    }

    // 2. Cache miss / expired — fetch from API
    try {
      const result = await fetchAdvice(data);
      setAdvice(result);
      setCachedAdvice(date, result);
    } catch {
      // Auto-fallback to local advice on API failure
      setAdvice(generateLocalAdvice({ avgScore: data.avgScore }));
      setIsLocalAdvice(true);
    } finally {
      setLoading(false);
    }
  }, [data, date]);
  
  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);
  
  return (
    <div className="bg-gradient-to-br from-white to-primary-light/30 rounded-2xl border border-border p-6 relative card-hover">
      {/* Left border accent */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${isLocalAdvice ? "bg-text-muted" : "bg-primary"}`} />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
              <path d="M9 20h6" />
              <path d="M10 22h4" />
            </svg>
            AI 健康顾问
            {isLocalAdvice && (
              <span className="text-xs font-normal bg-surface-alt text-text-muted px-2 py-0.5 rounded-full">
                通用建议
              </span>
            )}
          </h3>
          <p className="text-sm text-text-muted mt-0.5">
            {isLocalAdvice ? "AI 暂时不可用，以下为通用健康建议" : "基于今日检测数据生成的个性化建议"}
          </p>
        </div>
        {!loading && (
          <button onClick={() => load(false)} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {isLocalAdvice ? "重试 AI" : "重新生成"}
          </button>
        )}
      </div>
      
      {loading && (
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-text-secondary text-sm">AI 正在分析你的坐姿数据...</span>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-surface-alt rounded animate-pulse" style={{ width: `${80 + i * 5}%` }} />
          ))}
        </div>
      )}
      
      {!loading && (
        <div className="space-y-3">
          {advice.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                isLocalAdvice ? "bg-surface-alt text-text-muted" : "bg-primary-light text-primary"
              }`}>
                {i + 1}
              </span>
              <p className="text-sm text-text-primary leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border/50">
        {isLocalAdvice ? "通用健康建议 · 建议仅供参考" : "由 DeepSeek AI 提供分析支持 · 建议仅供参考"}
      </p>
    </div>
  );
}
