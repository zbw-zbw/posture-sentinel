"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { SessionSummaryData } from "@/hooks/useDetectSession";
import { getTodayDate } from "@/lib/storage";
import { COLORS, getScoreColor } from "@/lib/colors";

interface SessionSummaryProps {
  data: SessionSummaryData;
  onClose: () => void;
  onRestart?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s.toString().padStart(2, "0")}秒`;
}

function getComment(score: number, alertCount: number, goodPercent: number): string {
  if (score >= 80) {
    if (alertCount === 0) return "全程零提醒，坐姿标准！继续保持这个状态";
    return `表现很棒，良好姿态占比 ${goodPercent}%，继续保持`;
  }
  if (score >= 60) {
    if (alertCount > 5) return `提醒了 ${alertCount} 次，注意保持脊椎挺直，多活动肩颈`;
    return "还不错，但有提升空间。注意保持脊椎挺直";
  }
  if (alertCount > 10) return `不良姿态频发（${alertCount} 次提醒），建议检查座椅高度和屏幕位置`;
  return "需要注意了！建议每30分钟起身活动一下";
}

const CIRCUMFERENCE = 2 * Math.PI * 42;

interface MetricRow {
  label: string;
  value: number;
  unit: string;
  threshold: string;
  isBad: boolean;
}

export default function SessionSummary({ data, onClose, onRestart }: SessionSummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [advice, setAdvice] = useState<string[] | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const target = data.avgScore;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [data.avgScore]);

  const fetchAdvice = useCallback(async (signal?: AbortSignal) => {
    if (!data.metrics || data.duration === 0) return;
    setAdviceLoading(true);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avgScore: data.avgScore,
          goodPercent: data.goodPercent,
          warningPercent: data.warningPercent,
          badPercent: data.badPercent,
          avgHeadTilt: data.metrics.avgHeadTilt,
          avgShoulderTilt: data.metrics.avgShoulderTilt,
          avgNeckForward: data.metrics.avgNeckForward,
          avgSpineTilt: data.metrics.avgSpineTilt,
          alertCount: data.alertCount,
          totalDuration: Math.round(data.duration / 60),
          sessionCount: 1,
        }),
        signal,
      });
      const result = await res.json();
      if (result.advice && Array.isArray(result.advice)) {
        setAdvice(result.advice);
      }
    } catch {
      // silently fail
    } finally {
      setAdviceLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data.duration === 0 || !data.metrics) return;
    const abortController = new AbortController();
    const t = setTimeout(() => fetchAdvice(abortController.signal), 500);
    return () => {
      clearTimeout(t);
      abortController.abort();
    };
  }, [data, fetchAdvice]);

  const scoreColor = getScoreColor(data.avgScore);

  const metricRows: MetricRow[] = data.metrics ? [
    { label: "头部倾斜", value: data.metrics.avgHeadTilt, unit: "°", threshold: "正常 < 5°", isBad: data.metrics.avgHeadTilt > 5 },
    { label: "肩膀倾斜", value: data.metrics.avgShoulderTilt, unit: "°", threshold: "正常 < 3°", isBad: data.metrics.avgShoulderTilt > 3 },
    { label: "脖子前倾", value: data.metrics.avgNeckForward, unit: "%", threshold: "正常 < 30%", isBad: data.metrics.avgNeckForward > 30 },
    { label: "脊椎倾斜", value: data.metrics.avgSpineTilt, unit: "°", threshold: "正常 < 5°", isBad: data.metrics.avgSpineTilt > 5 },
  ] : [];

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="本次检测摘要">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — bottom sheet on mobile, centered card on desktop */}
      <div className="relative bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-text-primary">本次检测摘要</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {data.duration === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">检测时长不足 1 秒，无法生成报告</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Score + stats — horizontal on wider screens */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Score circle */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.border} strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary tabular-nums">{animatedScore}</span>
                    <span className="text-xs text-text-muted">综合分</span>
                  </div>
                </div>

                {/* Stats — compact grid next to score on desktop */}
                <div className="grid grid-cols-3 gap-2 flex-1 w-full">
                  <div className="bg-surface-alt rounded-xl p-2.5 text-center">
                    <p className="text-text-muted text-xs">时长</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5 tabular-nums">
                      {formatDuration(data.duration)}
                    </p>
                  </div>
                  <div className="bg-surface-alt rounded-xl p-2.5 text-center">
                    <p className="text-text-muted text-xs">提醒</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5 tabular-nums">
                      {data.alertCount}<span className="text-xs font-normal text-text-muted">次</span>
                    </p>
                  </div>
                  <div className="bg-primary-light rounded-xl p-2.5 text-center">
                    <p className="text-text-muted text-xs">良好</p>
                    <p className="text-sm font-semibold text-primary-text mt-0.5 tabular-nums">
                      {data.goodPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Posture distribution bar */}
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">姿态分布</p>
                <div className="flex h-3 rounded-full overflow-hidden">
                  {data.goodPercent > 0 && (
                    <div className="bg-primary transition-all duration-700 ease-out" style={{ width: `${data.goodPercent}%` }} />
                  )}
                  {data.warningPercent > 0 && (
                    <div className="bg-warning transition-all duration-700 ease-out" style={{ width: `${data.warningPercent}%` }} />
                  )}
                  {data.badPercent > 0 && (
                    <div className="bg-danger transition-all duration-700 ease-out" style={{ width: `${data.badPercent}%` }} />
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />良好 {data.goodPercent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-warning" />注意 {data.warningPercent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-danger" />不良 {data.badPercent}%
                  </span>
                </div>
              </div>

              {/* Average metrics */}
              {metricRows.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">平均指标</p>
                  <div className="grid grid-cols-2 gap-2">
                    {metricRows.map((row) => (
                      <div key={row.label} className="bg-surface-alt rounded-lg px-3 py-2.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-text-secondary">{row.label}</span>
                          <span className={`text-sm font-semibold tabular-nums ${row.isBad ? "text-danger-text" : "text-text-primary"}`}>
                            {row.value}{row.unit}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">{row.threshold}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Advice */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <p className="text-sm font-semibold text-text-primary">AI 改善建议</p>
                </div>
                {adviceLoading ? (
                  <div className="bg-primary-light rounded-xl p-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-text-secondary">AI 正在分析...</span>
                  </div>
                ) : advice && advice.length > 0 ? (
                  <div className="bg-primary-light rounded-xl p-3">
                    <ul className="space-y-1.5">
                      {advice.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center mt-0.5 font-bold">{i + 1}</span>
                          <span className="text-sm text-text-secondary leading-snug">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-surface-alt rounded-xl p-3">
                    <p className="text-sm text-text-muted">{getComment(data.avgScore, data.alertCount, data.goodPercent)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer with actions */}
        {data.duration > 0 && (
          <div className="px-6 py-4 border-t border-border flex-shrink-0 bg-surface">
            <div className="flex gap-3">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-3 rounded-xl transition-colors text-sm min-h-11"
                >
                  再测一次
                </button>
              )}
              <Link
                href={`/report?date=${getTodayDate()}`}
                className="flex-1 text-center bg-primary-dark hover:bg-primary text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20 min-h-11 flex items-center justify-center gap-1.5"
              >
                查看详细报告
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
