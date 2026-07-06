"use client";

import { useState, useEffect, useMemo } from "react";
import {
  generateDailyReport,
  getWeeklyScores,
  getYesterdayReport,
  getAvailableDates,
  getHourlyScores,
  getWeekComparison,
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
import CalendarHeatmap from "./CalendarHeatmap";
import HourlyHeatmap from "./HourlyHeatmap";
import EmptyState from "./EmptyState";
import DailyGoalCard from "./DailyGoalCard";
import ExportButton from "./ExportButton";

interface DailyReportProps {
  initialDate?: string;
}

function getEncouragement(score: number): { text: string; color: string } {
  if (score >= 90) {
    return { text: "太棒了！今日坐姿非常优秀，继续保持好习惯。", color: "bg-primary-light text-primary-text" };
  }
  if (score >= 75) {
    return { text: "今日坐姿不错，注意偶尔起身活动，保护脊椎。", color: "bg-primary-light text-primary-text" };
  }
  if (score >= 60) {
    return { text: "坐姿还有提升空间，试着挺直腰背、调整屏幕高度。", color: "bg-warning-light text-warning-text" };
  }
  return { text: "今日坐姿需要关注，建议设置提醒，逐步改善坐姿。", color: "bg-danger-light text-danger-text" };
}

export default function DailyReport({ initialDate }: DailyReportProps) {
  const { settings } = useSettings();
  const [date, setDate] = useState(initialDate || getTodayDate());
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [weeklyScores, setWeeklyScores] = useState(getWeeklyScores());
  const [yesterdayReport, setYesterdayReport] = useState<DailyReportData | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [hourlyData, setHourlyData] = useState<ReturnType<typeof getHourlyScores>>([]);
  const [weekComp, setWeekComp] = useState<ReturnType<typeof getWeekComparison>>({
    thisWeekAvg: 0, lastWeekAvg: 0, scoreDelta: 0,
    thisWeekSessions: 0, lastWeekSessions: 0, sessionDelta: 0,
    thisWeekMinutes: 0, lastWeekMinutes: 0, minutesDelta: 0,
  });
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
    // Use requestAnimationFrame for smoother UX (avoids blocking main thread)
    requestAnimationFrame(() => {
      if (cancelled) return;
      setReport(generateDailyReport(date));
      setWeeklyScores(getWeeklyScores());
      setYesterdayReport(getYesterdayReport());
      setAvailableDates(getAvailableDates());
      setHourlyData(getHourlyScores());
      setWeekComp(getWeekComparison());
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [date]);

  // Listen for session-saved events (e.g. when navigating from detect page
  // after stopping a session — the date hasn't changed but data has)
  useEffect(() => {
    const handler = () => {
      setReport(generateDailyReport(date));
      setWeeklyScores(getWeeklyScores());
      setYesterdayReport(getYesterdayReport());
      setAvailableDates(getAvailableDates());
      setHourlyData(getHourlyScores());
      setWeekComp(getWeekComparison());
    };
    window.addEventListener("posture-sentinel:session-saved", handler);
    return () => window.removeEventListener("posture-sentinel:session-saved", handler);
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
        <ExportButton targetId="report-content" disabled={!report} />
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
          <section className="fade-in" style={{ transitionDelay: "0ms" }}>
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
          <section className="fade-in" style={{ transitionDelay: "80ms" }}>
            {aiRequestData && (
              <AIAdvice data={aiRequestData} date={date} />
            )}
          </section>

          {/* Row 3: Score Trend Line Chart */}
          <section className="fade-in" style={{ transitionDelay: "160ms" }}>
            <div className="bg-surface rounded-2xl p-6 card-hover">
              <h3 className="text-lg font-bold text-text-primary mb-4">今日评分变化趋势</h3>
              <PostureChart scoreTimeline={report.scoreTimeline} />
            </div>
          </section>

          {/* Row 4: Metrics Summary + Weekly Trend */}
          <section className="fade-in" style={{ transitionDelay: "240ms" }}>
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

          {/* Row 5: Hourly Heatmap + Week Comparison */}
          <section className="fade-in" style={{ transitionDelay: "320ms" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hourly heatmap */}
              <div className="bg-surface rounded-2xl p-6 card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-1">时段分析</h3>
                <p className="text-xs text-text-muted mb-4">基于全部历史数据，展示你的坐姿时段规律</p>
                <HourlyHeatmap data={hourlyData} />
              </div>
              {/* Week comparison */}
              <div className="bg-surface rounded-2xl p-6 card-hover">
                <h3 className="text-lg font-bold text-text-primary mb-1">周环比</h3>
                <p className="text-xs text-text-muted mb-4">本周 vs 上周坐姿改善情况</p>
                {weekComp.thisWeekAvg === 0 && weekComp.lastWeekAvg === 0 ? (
                  <p className="py-6 text-sm text-text-muted text-center">
                    暂无上周数据，继续使用即可看到周环比分析
                  </p>
                ) : (
                  <div className="space-y-3">
                    <ComparisonRow
                      label="平均评分"
                      thisValue={`${weekComp.thisWeekAvg}分`}
                      lastValue={`${weekComp.lastWeekAvg}分`}
                      delta={weekComp.scoreDelta}
                      unit="分"
                    />
                    <ComparisonRow
                      label="检测时长"
                      thisValue={`${weekComp.thisWeekMinutes}分钟`}
                      lastValue={`${weekComp.lastWeekMinutes}分钟`}
                      delta={weekComp.minutesDelta}
                      unit="分钟"
                    />
                    <ComparisonRow
                      label="检测次数"
                      thisValue={`${weekComp.thisWeekSessions}次`}
                      lastValue={`${weekComp.lastWeekSessions}次`}
                      delta={weekComp.sessionDelta}
                      unit="次"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Row 6: Calendar Heatmap (interactive monthly view) */}
          <section className="fade-in" style={{ transitionDelay: "400ms" }}>
            <div className="bg-surface rounded-2xl p-6 card-hover">
              <h3 className="text-lg font-bold text-text-primary mb-4">月度趋势日历</h3>
              <p className="text-sm text-text-secondary mb-4">
                点击日期查看当日详情，用方向键浏览历史月份
              </p>
              <CalendarHeatmap />
            </div>
          </section>

          {/* Row 7: Session Records */}
          <section className="fade-in" style={{ transitionDelay: "480ms" }}>
            <div className="bg-surface rounded-2xl p-6 card-hover">
              <h3 className="text-lg font-bold text-text-primary mb-4">今日检测记录</h3>
              <div className="space-y-3">
                {report.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-2 sm:gap-4 p-4 bg-surface-alt rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-light text-primary-text text-sm font-bold flex items-center justify-center">
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
                            ? "bg-primary-light text-primary-text"
                            : session.avgScore >= 60
                            ? "bg-warning-light text-warning-text"
                            : "bg-danger-light text-danger-text"
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

function ComparisonRow({
  label,
  thisValue,
  lastValue,
  delta,
}: {
  label: string;
  thisValue: string;
  lastValue: string;
  delta: number;
  unit: string;
}) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isScore = label.includes("评分");

  // For score, positive delta = improvement (green). For duration/count, neutral.
  const deltaColor = isScore
    ? isPositive ? "text-primary-text" : isNegative ? "text-danger-text" : "text-text-muted"
    : isPositive ? "text-primary-text" : isNegative ? "text-warning-text" : "text-text-muted";
  const deltaIcon = isPositive ? "↑" : isNegative ? "↓" : "—";

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-semibold text-text-primary">{thisValue}</span>
          <span className="text-xs text-text-muted ml-1.5">上周 {lastValue}</span>
        </div>
        <span className={`text-sm font-medium tabular-nums w-12 text-right ${deltaColor}`}>
          {deltaIcon} {Math.abs(delta)}
        </span>
      </div>
    </div>
  );
}
