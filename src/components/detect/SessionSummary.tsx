"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionSummaryData } from "@/hooks/useDetectSession";
import { getTodayDate } from "@/lib/storage";

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

const CIRCUMFERENCE = 2 * Math.PI * 42; // ~264

export default function SessionSummary({ data, onClose, onRestart }: SessionSummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate the score ring from 0 to actual score
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

  const scoreColor = data.avgScore >= 80 ? "#10b981" : data.avgScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="本次检测摘要">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-6">本次检测摘要</h2>

        {data.duration === 0 ? (
          <div className="text-center py-8 mb-6">
            <p className="text-text-secondary">检测时长不足 1 秒，无法生成报告</p>
          </div>
        ) : (
          <>
            {/* Score circle */}
            <div className="flex justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  {/* Score arc */}
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-text-primary tabular-nums">{animatedScore}</span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface-alt rounded-xl p-3 text-center">
                <p className="text-text-muted text-xs">检测时长</p>
                <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">
                  {formatDuration(data.duration)}
                </p>
              </div>
              <div className="bg-surface-alt rounded-xl p-3 text-center">
                <p className="text-text-muted text-xs">提醒次数</p>
                <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">
                  {data.alertCount}次
                </p>
              </div>
            </div>

            {/* Posture distribution bar */}
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-2">姿态分布</p>
              <div className="flex h-4 rounded-full overflow-hidden">
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
                <span>良好 {data.goodPercent}%</span>
                <span>注意 {data.warningPercent}%</span>
                <span>不良 {data.badPercent}%</span>
              </div>
            </div>

            {/* Comment */}
            <div className="bg-surface-alt rounded-xl p-4 mb-6">
              <p className="text-sm text-text-secondary">{getComment(data.avgScore, data.alertCount, data.goodPercent)}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {data.duration > 0 && (
            <div className="flex gap-3">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  再测一次
                </button>
              )}
              <Link
                href={`/report?date=${getTodayDate()}`}
                className="flex-1 text-center border border-primary text-primary hover:bg-primary-light font-medium py-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                查看详细报告
                <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block ml-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-sm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
