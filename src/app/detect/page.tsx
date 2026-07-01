"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { usePostureMetrics } from "@/hooks/usePostureMetrics";
import { usePostureAnalyzer } from "@/hooks/usePostureAnalyzer";
import { useAlertSystem } from "@/hooks/useAlertSystem";
import { useDetectSession } from "@/hooks/useDetectSession";
import { useSettings } from "@/hooks/useSettings";
import { useRestReminder } from "@/hooks/useRestReminder";
import { useBaseline } from "@/hooks/useBaseline";
import { useAchievements } from "@/hooks/useAchievements";
import { initAudio } from "@/lib/sound";
import { saveSession, generateId, getTodayDate } from "@/lib/storage";
import CameraView from "@/components/detect/CameraView";
import MetricsPanel from "@/components/detect/MetricsPanel";
import DetectControls from "@/components/detect/DetectControls";
import AlertNotification from "@/components/detect/AlertNotification";
import PostureTimeline from "@/components/detect/PostureTimeline";
import SessionSummary from "@/components/detect/SessionSummary";
import CalibrationWizard from "@/components/detect/CalibrationWizard";
import RestReminderBanner, { RestTriggerPrompt } from "@/components/detect/RestReminderBanner";
import AchievementToast from "@/components/detect/AchievementToast";
import BaselineSampling from "@/components/detect/BaselineSampling";
import type { SessionSummaryData } from "@/hooks/useDetectSession";
import ErrorBoundary from "@/components/ErrorBoundary";

type DetectState = "idle" | "detecting" | "paused";

export default function DetectPage() {
  const { settings } = useSettings();
  const { videoRef, isActive, isLoading, error, startCamera, stopCamera } = useCamera();
  const {
    landmarks,
    isModelLoading,
    isDetecting,
    loadError,
    fps,
    startDetection,
    stopDetection,
  } = usePoseDetection(settings.detectionFps);
  const metrics = usePostureMetrics(landmarks, {
    headAngleThreshold: settings.headAngleThreshold,
    shoulderThreshold: settings.shoulderThreshold,
    spineAngleThreshold: settings.spineAngleThreshold,
  });

  const analyzer = usePostureAnalyzer(settings);
  const {
    isAlertVisible,
    alertMessage,
    alertType,
    showAlert,
    dismissAlert,
  } = useAlertSystem(settings.alertMethod, settings.alertVolume);
  const {
    sessionState,
    elapsedTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    getElapsedTime,
  } = useDetectSession();

  const [detectState, setDetectState] = useState<DetectState>("idle");
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDataLocal, setSummaryDataLocal] = useState<SessionSummaryData | null>(null);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showBaselineSampling, setShowBaselineSampling] = useState(false);

  // Rest reminder, baseline, and achievements
  const restReminder = useRestReminder(detectState === "detecting", detectState === "paused");
  const { baseline, hasBaseline, captureBaseline } = useBaseline();
  const achievements = useAchievements(settings.dailyGoalMinutes);

  // Check if first-time user and show calibration wizard
  useEffect(() => {
    const hasCalibrated = localStorage.getItem("posture-sentinel:calibrated");
    if (!hasCalibrated) {
      setShowWizard(true);
    }
  }, []);

  const handleWizardComplete = () => {
    localStorage.setItem("posture-sentinel:calibrated", "true");
    setShowWizard(false);
  };

  // Feed metrics to analyzer - ALWAYS feed when detecting, even if score is 0
  // This ensures the analyzer's timer tracks duration correctly
  useEffect(() => {
    if (detectState === "detecting") {
      analyzer.updateMetrics(metrics);
    }
  }, [metrics, detectState, analyzer]);

  // Handle alert triggers from analyzer
  useEffect(() => {
    if (analyzer.shouldAlert && analyzer.alertMessage) {
      showAlert(analyzer.alertMessage, "bad");
    }
  }, [analyzer.shouldAlert, analyzer.alertMessage, showAlert]);

  const handleStart = useCallback(async () => {
    initAudio();
    setShowCompletionBanner(false);
    await startCamera();
    setDetectState("detecting");
    startSession();
    analyzer.start();
  }, [startCamera, startSession, analyzer]);

  const handlePause = useCallback(() => {
    stopDetection();
    analyzer.pause();
    pauseSession();
    setDetectState("paused");
  }, [stopDetection, analyzer, pauseSession]);

  const handleResume = useCallback(async () => {
    if (videoRef.current) {
      await startDetection(videoRef.current);
    }
    analyzer.resume();
    resumeSession();
    setDetectState("detecting");
  }, [startDetection, videoRef, analyzer, resumeSession]);

  const handleStop = useCallback(() => {
    // Capture current metrics BEFORE stopping detection (which clears landmarks)
    const finalMetrics = { ...metrics };
    // 使用 getElapsedTime 读取当前真实经过时间，而不是可能过期的 elapsedTime state
    const currentElapsed = getElapsedTime();

    // 从 refs 获取最新统计数据（不依赖 React state）
    const stats = analyzer.finalize();

    stopDetection();
    stopCamera();
    analyzer.pause();

    // 使用 elapsedTime 作为最终 duration（更可靠）
    const finalStats = { ...stats, totalDuration: currentElapsed };

    const summary = endSession(finalStats);
    setSummaryDataLocal(summary);

    // Save session to localStorage
    saveSession({
      id: generateId(),
      date: getTodayDate(),
      startTime: Date.now() - summary.duration * 1000,
      endTime: Date.now(),
      duration: summary.duration,
      avgScore: summary.avgScore,
      goodPercent: summary.goodPercent,
      warningPercent: summary.warningPercent,
      badPercent: summary.badPercent,
      alertCount: summary.alertCount,
      scoreHistory: summary.scoreHistory,
      metrics: {
        avgHeadTilt: finalMetrics.headTiltAngle,
        avgShoulderTilt: finalMetrics.shoulderTiltAngle,
        avgNeckForward: finalMetrics.neckForwardScore,
        avgSpineTilt: finalMetrics.spineTiltAngle,
      },
    });

    setDetectState("idle");
    setShowSummary(true);
    setShowCompletionBanner(true);

    // Check for newly unlocked achievements after saving session
    setTimeout(() => {
      achievements.checkAndUnlock();
    }, 500);
  }, [stopDetection, stopCamera, analyzer, endSession, metrics, getElapsedTime, achievements]);

  // Start detection when camera becomes active
  useEffect(() => {
    if (isActive && detectState === "detecting" && videoRef.current) {
      startDetection(videoRef.current);
    }
  }, [isActive, detectState, startDetection, videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      stopCamera();
    };
  }, [stopDetection, stopCamera]);

  // Beforeunload warning when detecting
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (detectState === "detecting" || detectState === "paused") {
        e.preventDefault();
        e.returnValue = "检测正在进行中，确定要离开吗？当前会话数据将丢失。";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [detectState]);

  // Request notification permission on first start
  useEffect(() => {
    if (detectState === "detecting" && "Notification" in window && Notification.permission === "default") {
      // Request permission after a short delay to not block the start flow
      const t = setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [detectState]);

  // Show system notification when alert fires and page is not visible
  useEffect(() => {
    if (isAlertVisible && "Notification" in window && Notification.permission === "granted" && document.hidden) {
      try {
        new Notification("体态哨兵 - 坐姿提醒", {
          body: alertMessage || "请注意你的坐姿！",
          icon: "/favicon.svg",
          tag: "posture-alert",
        });
      } catch {
        // Silently ignore notification errors
      }
    }
  }, [isAlertVisible, alertMessage]);

  // Map detectState for DetectControls
  const controlState: DetectState = detectState;

  // Handle baseline capture
  const handleBaselineCapture = useCallback((data: { headTilt: number; shoulderTilt: number; neckForward: number; spineTilt: number }) => {
    captureBaseline(data);
  }, [captureBaseline]);

  // Start camera for baseline sampling
  const handleStartBaselineSampling = useCallback(async () => {
    await startCamera();
    setShowBaselineSampling(true);
  }, [startCamera]);

  // Close baseline sampling and stop camera if not detecting
  const handleCloseBaselineSampling = useCallback(() => {
    setShowBaselineSampling(false);
    if (detectState === "idle") {
      stopCamera();
    }
  }, [detectState, stopCamera]);

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light/10 to-transparent -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              实时坐姿检测
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              打开摄像头，AI 实时分析你的坐姿状态
            </p>
          </div>
        </section>

        {/* Main content: camera + metrics */}
        {showCompletionBanner && !isDetecting && (
          <div className="bg-primary-light border border-primary/20 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">检测已完成！</p>
                <p className="text-xs text-text-secondary">查看今日报告或开始新的检测</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/report?date=${getTodayDate()}`} className="bg-surface hover:bg-surface-alt text-text-primary font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                查看报告
              </Link>
              <button onClick={handleStart} className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                再测一次
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-start">
          {/* Camera area */}
          <div className="lg:col-span-3">
            <CameraView
              videoRef={videoRef}
              landmarks={landmarks}
              status={analyzer.currentStatus}
              isActive={isActive}
              isDetecting={isDetecting}
              isPaused={detectState === "paused"}
              isModelLoading={isModelLoading}
              loadError={loadError}
              isRequestingPermission={isLoading}
              error={error}
              headTiltAngle={metrics.headTiltAngle}
            />
          </div>

          {/* Metrics panel */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl p-5 md:p-6 h-full card-hover">
              <MetricsPanel
                metrics={metrics}
                fps={fps}
                sessionDuration={sessionState === "idle" ? 0 : elapsedTime}
                isDetecting={isDetecting}
                statusDuration={analyzer.statusDuration}
                currentStatus={analyzer.currentStatus}
                alertCount={analyzer.sessionStats.alertCount}
              />
            </div>
          </div>
        </div>

        {/* Posture Timeline - 实时姿态时间线 */}
        {(detectState === "detecting" || detectState === "paused") && (
          <div className="mt-4">
            {detectState === "paused" && (
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning text-xs font-medium px-3 py-1 rounded-full">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  已暂停
                </span>
              </div>
            )}
            <PostureTimeline scoreHistory={analyzer.sessionStats.scoreHistory} duration={sessionState === "idle" ? 0 : elapsedTime} />
          </div>
        )}

        {/* Rest reminder progress bar (during counting) */}
        {restReminder.settings.enabled && (detectState === "detecting" || detectState === "paused") && restReminder.phase !== "triggered" && restReminder.phase !== "resting" && (
          <div className="mt-3">
            <RestReminderBanner
              phase={restReminder.phase}
              elapsedSinceLastRest={restReminder.elapsedSinceLastRest}
              restRemaining={restReminder.restRemaining}
              progress={restReminder.progress}
              intervalMinutes={restReminder.settings.intervalMinutes}
              showStretchGuide={restReminder.settings.showStretchGuide}
              onStartRest={restReminder.startRestNow}
              onSnooze={restReminder.snooze}
              onSkip={restReminder.skipRest}
              onSkipRest={restReminder.skipRest}
            />
          </div>
        )}

        {/* Controls */}
        <div className="mt-8">
          <DetectControls
            state={controlState}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
          <p className="text-center text-xs text-text-muted mt-4">
            提示：坐姿持续不良超过 {settings.badPostureThreshold} 秒后会自动触发提醒
            {restReminder.settings.enabled && ` · 每 ${restReminder.settings.intervalMinutes} 分钟提醒休息`}
          </p>
          {/* Baseline calibration button */}
          <div className="text-center mt-3">
            <button
              onClick={handleStartBaselineSampling}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {hasBaseline ? "重新校准个人基线" : "校准个人姿态基线"}
              {hasBaseline && <span className="text-primary">（已校准）</span>}
            </button>
          </div>
        </div>

      </div>

      {/* Alert Notification (fixed) */}
      <AlertNotification
        isVisible={isAlertVisible}
        message={alertMessage}
        type={alertType}
        alertCount={analyzer.sessionStats.alertCount}
        statusDuration={analyzer.statusDuration}
        onDismiss={dismissAlert}
      />

      {/* Session Summary Modal */}
      {showSummary && summaryDataLocal && (
        <SessionSummary
          data={summaryDataLocal}
          onClose={() => setShowSummary(false)}
          onRestart={() => { setShowSummary(false); setShowCompletionBanner(false); handleStart(); }}
        />
      )}
    </div>
    {/* Calibration Wizard */}
    {showWizard && (
      <CalibrationWizard onComplete={handleWizardComplete} onSkip={handleWizardComplete} />
    )}

    {/* Rest trigger prompt - shows when rest time arrives */}
    {restReminder.settings.enabled && restReminder.phase === "triggered" && (
      <RestTriggerPrompt
        elapsedMinutes={restReminder.settings.intervalMinutes}
        onStart={restReminder.startRestNow}
        onSnooze={restReminder.snooze}
        onSkip={restReminder.skipRest}
      />
    )}

    {/* Rest overlay - shows during rest countdown */}
    {restReminder.settings.enabled && restReminder.phase === "resting" && (
      <RestReminderBanner
        phase={restReminder.phase}
        elapsedSinceLastRest={restReminder.elapsedSinceLastRest}
        restRemaining={restReminder.restRemaining}
        progress={restReminder.progress}
        intervalMinutes={restReminder.settings.intervalMinutes}
        showStretchGuide={restReminder.settings.showStretchGuide}
        onStartRest={restReminder.startRestNow}
        onSnooze={restReminder.snooze}
        onSkip={restReminder.skipRest}
        onSkipRest={restReminder.skipRest}
      />
    )}

    {/* Achievement toast */}
    <AchievementToast
      achievement={achievements.newlyUnlocked}
      onDismiss={achievements.dismissToast}
    />

    {/* Baseline sampling overlay */}
    {showBaselineSampling && (
      <BaselineSampling
        metrics={landmarks && landmarks.length > 0 ? {
          headTiltAngle: metrics.headTiltAngle,
          shoulderTiltAngle: metrics.shoulderTiltAngle,
          neckForwardScore: metrics.neckForwardScore,
          spineTiltAngle: metrics.spineTiltAngle,
        } : null}
        isActive={isDetecting}
        onCapture={handleBaselineCapture}
        onCancel={handleCloseBaselineSampling}
      />
    )}
    </ErrorBoundary>
  );
}