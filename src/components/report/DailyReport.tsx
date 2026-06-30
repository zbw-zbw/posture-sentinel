"use client";

import { useState, useEffect, useMemo } from "react";
import {
  generateDailyReport,
  getWeeklyScores,
  getYesterdayReport,
  getAvailableDates,
  type DailyReportData,
} from "@/lib/report";
import { getTodayDate, getDailyGoalProgress, type DailyGoalProgress } from "@/lib/storage";
import { useSettings } from "@/hooks/useSettings";
import DatePicker from "./DatePicker";
import ScoreRing from "./ScoreRing";
import DistributionBar from "./DistributionBar";
import PostureChart from "./PostureChart";
import MetricsSummary from "./MetricsSummary";
import WeeklyTrend from "./WeeklyTrend";
import AIAdvice from "./AIAdvice";
import MonthlyHeatmap from "./MonthlyHeatmap";
import EmptyState from "./EmptyState";
import DailyGoalCard from "./DailyGoalCard";
import ExportButton from "./ExportButton";

interface DailyReportProps {
  initialDate?: string;
}

function getEncouragement(score: number): { text: string; color: string } {
  if (score >= 90) {
    return { text: "太棒了！今日坐姿非常优秀，继续保持好习惯。", color: "bg-primary-light text-primary" };
  }
  if (score >= 75) {
    return { text: "今日坐姿不错，注意偶尔起身活动，保护脊椎。", color: "bg-primary-light text-primary" };
  }
  if (score >= 60) {
    return { text: "坐姿还有提升空间，试着挺直腰背、调整屏幕高度。", color: "bg-warning-light text-warning" };
  }
  return { text: "今日坐姿需要关注，建议设置提醒，逐步改善坐姿。", color: "bg-danger-light text-danger" };
}

export default function DailyReport({ initialDate }: DailyReportProps) {
  const { settings } = useSettings();
  const [date, setDate] = useState(initialDate || getTodayDate());
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [weeklyScores, setWeeklyScores] = useState(getWeeklyScores());
  const [yesterdayReport, setYesterdayReport] = useState<DailyReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const goalProgress: DailyGoalProgress = useMemo(
    () => getDailyGoalProgress(settings.dailyGoalMinutes),
    // Recompute when report changes (new session saved) or settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.dailyGoalMinutes, report]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Use requestAnimationFrame instead of setTimeout for smoother UX
    requestAnimationFrame(() => {
      if (cancelled) return;
      setReport(generateDailyReport(date));
      setWeeklyScores(getWeeklyScores());
      setYesterdayReport(getYesterdayReport());
      setAvailableDates(getAvailableDates());
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [date]);

  const aiRequestData = useMemo(() => {
    if (!report) return null;
    return {
      avgScore: report.avgScore,
      goodPercent: report.goodPercent,
      warningPercent: report.warningPercent,
      badPercent: report.badPercent,
      avgHeadTilt: report.avgMetrics.headTilt,
      avgShoulderTilt: report.avgMetrics.shoulderTilt,
      avgNeckForward: report.avgMetrics.neckForward,
      avgSpineTilt: report.avgMetrics.spineTilt,
      alertCount: report.totalAlerts,
      totalDuration: report.totalDuration,
      sessionCount: report.sessionCount,
    };
  }, [report]);

  const encouragement = useMemo(() => {
    if (!report) return null;
    return getEncouragement(report.avgScore);
  }, [report]);

  const yesterdayMetrics = yesterdayReport
    ? {
        headTilt: yesterdayReport.avgMetrics.headTilt,
        shoulderTilt: yesterdayReport.avgMetrics.shoulderTilt,
        neckForward: yesterdayReport.avgMetrics.neckForward,
        spineTilt: yesterdayReport.avgMetrics.spineTilt,
        alertCount: yesterdayReport.totalAlerts,
      }
    : undefined;

  const reportDate = new Date(date + "T00:00:00");
  const heatmapYear = reportDate.getFullYear();
  const heatmapMonth = reportDate.getMonth();

  return (
    <div id="report-content">
      {/* Date Picker + Export */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1">
          <DatePicker date={date} onChange={setDate} availableDates={availableDates} />
        </div>
        <ExportButton targetId="report-content" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !report && <EmptyState date={date} />}

      {!loading && report && (
        <div className="space-y-6">
          {/* Encouragement Card */}
          {encouragement && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${encouragement.color}`}>
              {encouragement.text}
            </div>
          )}

          {/* Row 1: Score Ring + Daily Goal + Distribution */}
          <section className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface rounded-2xl p-6 flex flex-col items-center justify-center card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-4 self-start flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  今日评分
                </h3>
                <ScoreRing
                  score={report.avgScore}
                  yesterdayScore={yesterdayReport?.avgScore}
                />
              </div>

              <DailyGoalCard progress={goalProgress} />

              <div className="bg-surface rounded-2xl p-6 card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-4">姿态分布</h3>
                <DistributionBar
                  goodPercent={report.goodPercent}
                  warningPercent={report.warningPercent}
                  badPercent={report.badPercent}
                  totalDuration={report.totalDuration}
                />
              </div>
            </div>
          </section>

          {/* Row 2: AI Advice */}
          <section className="fade-in">
            {aiRequestData && (
              <AIAdvice data={aiRequestData} date={date} />
            )}
          </section>

          {/* Row 3: Score Trend Line Chart */}
          <section className="fade-in">
            <div className="bg-surface rounded-2xl p-6 card-hover">
              <h3 className="text-lg font-bold text-text-primary mb-4">今日评分变化趋势</h3>
              <PostureChart scoreTimeline={report.scoreTimeline} />
            </div>
          </section>

          {/* Row 4: Metrics Summary + Weekly Trend */}
          <section className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-2xl p-6 card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-4">关键指标</h3>
                <MetricsSummary
                  headTilt={report.avgMetrics.headTilt}
                  shoulderTilt={report.avgMetrics.shoulderTilt}
                  neckForward={report.avgMetrics.neckForward}
                  spineTilt={report.avgMetrics.spineTilt}
                  alertCount={report.totalAlerts}
                  yesterdayMetrics={yesterdayMetrics}
                />
              </div>

              <div className="bg-surface rounded-2xl p-6 card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-4">本周趋势</h3>
                <WeeklyTrend scores={weeklyScores} />
              </div>
            </div>
          </section>

          {/* Row 5: Monthly Heatmap */}
          <section className="fade-in">
            <MonthlyHeatmap year={heatmapYear} month={heatmapMonth} />
          </section>

          {/* Row 6: Session Records */}
          <section className="fade-in">
            <div className="bg-surface rounded-2xl p-6 card-hover">
              <h3 className="text-lg font-bold text-text-primary mb-4">今日检测记录</h3>
              <div className="space-y-3">
                {report.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-2 sm:gap-4 p-4 bg-surface-alt rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-medium whitespace-nowrap">
                        {new Date(session.startTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(session.endTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 break-words">
                        时长 {Math.floor(session.duration / 60)}分{session.duration % 60}秒 · 提醒 {session.alertCount} 次
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                          session.avgScore >= 80
                            ? "bg-primary-light text-primary"
                            : session.avgScore >= 60
                            ? "bg-warning-light text-warning"
                            : "bg-danger-light text-danger"
                        }`}
                      >
                        {session.avgScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
