"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAdvice } from "@/lib/deepseek";
import type { AdviceRequest } from "@/lib/deepseek";

interface AIAdviceProps {
  data: AdviceRequest;
}

export default function AIAdvice({ data }: AIAdviceProps) {
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchAdvice(data);
      setAdvice(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [data]);
  
  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);
  
  return (
    <div className="bg-gradient-to-br from-white to-primary-light/30 rounded-2xl border border-border p-6 relative">
      {/* Left border accent */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary" />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">🤖 AI 健康顾问</h3>
          <p className="text-sm text-text-muted mt-0.5">基于今日检测数据生成的个性化建议</p>
        </div>
        {!loading && (
          <button onClick={load} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
            🔄 重新生成
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
      
      {error && !loading && (
        <div className="text-center py-4">
          <p className="text-text-secondary text-sm mb-3">AI 分析暂时不可用，请稍后重试</p>
          <button onClick={load} className="bg-primary hover:bg-primary-dark text-white text-sm px-4 py-2 rounded-lg transition-colors">
            重试
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <div className="space-y-3">
          {advice.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-text-primary leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border">
        由 DeepSeek AI 提供分析支持 · 建议仅供参考
      </p>
    </div>
  );
}
