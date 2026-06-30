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
import { initAudio } from "@/lib/sound";
import { saveSession, generateId, getTodayDate } from "@/lib/storage";
import CameraView from "@/components/detect/CameraView";
import MetricsPanel from "@/components/detect/MetricsPanel";
import DetectControls from "@/components/detect/DetectControls";
import AlertNotification from "@/components/detect/AlertNotification";
import PostureTimeline from "@/components/detect/PostureTimeline";
import SessionSummary from "@/components/detect/SessionSummary";
import CalibrationWizard from "@/components/detect/CalibrationWizard";
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
  }, [stopDetection, stopCamera, analyzer, endSession, metrics, getElapsedTime]);

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

  // Map detectState for DetectControls
  const controlState: DetectState = detectState;

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
          </p>
        </div>

        {/* Posture Timeline - 实时姿态时间线 */}
        {detectState === "detecting" && (
          <div className="mt-4">
            <PostureTimeline scoreHistory={analyzer.sessionStats.scoreHistory} duration={sessionState === "idle" ? 0 : elapsedTime} />
          </div>
        )}
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
    </ErrorBoundary>
  );
}