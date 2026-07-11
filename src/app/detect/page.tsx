"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { usePomodoro } from "@/hooks/usePomodoro";
import { initAudio, playPhaseChangeSound } from "@/lib/sound";
import { saveSession, generateId, getTodayDate } from "@/lib/storage";
import CameraView from "@/components/detect/CameraView";
import MetricsPanel from "@/components/detect/MetricsPanel";
import PostureGauge from "@/components/detect/PostureGauge";
import DetectControls from "@/components/detect/DetectControls";
import AlertNotification from "@/components/detect/AlertNotification";
import PostureTimeline from "@/components/detect/PostureTimeline";
import SessionSummary from "@/components/detect/SessionSummary";
import CalibrationWizard from "@/components/detect/CalibrationWizard";
import RestReminderBanner, { RestTriggerPrompt } from "@/components/detect/RestReminderBanner";
import KeyboardHelpOverlay from "@/components/detect/KeyboardHelpOverlay";
import AchievementToast from "@/components/detect/AchievementToast";
import VoiceIndicator from "@/components/detect/VoiceIndicator";
import PomodoroTimer from "@/components/detect/PomodoroTimer";
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

  // Load baseline early (needed by usePostureMetrics)
  const { baseline, hasBaseline, captureBaseline } = useBaseline();

  const metrics = usePostureMetrics(landmarks, {
    headAngleThreshold: settings.headAngleThreshold,
    shoulderThreshold: settings.shoulderThreshold,
    spineAngleThreshold: settings.spineAngleThreshold,
    baseline: baseline,
  });

  // Keep a ref to latest metrics so handleStop doesn't need metrics in its deps
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

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

  // Rest reminder and achievements
  const restReminder = useRestReminder(detectState === "detecting", detectState === "paused");
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

  // Feed metrics to analyzer - skip during rest periods to avoid recording
  // "bad posture" while the user is away from the desk stretching.
  // Also pause/resume the analyzer so its internal timer doesn't keep
  // accumulating duration against stale (frozen) metrics.
  const prevRestPhaseRef = useRef(restReminder.phase);
  useEffect(() => {
    const prevPhase = prevRestPhaseRef.current;
    prevRestPhaseRef.current = restReminder.phase;

    // Entering rest or triggered: pause analyzer to freeze duration counting
    if ((restReminder.phase === "resting" || restReminder.phase === "triggered") &&
        prevPhase !== "resting" && prevPhase !== "triggered" &&
        detectState === "detecting") {
      analyzer.pause();
    }
    // Exiting rest back to counting: resume analyzer
    if (restReminder.phase === "counting" &&
        (prevPhase === "resting" || prevPhase === "triggered") &&
        detectState === "detecting") {
      analyzer.resume();
    }

    if (detectState === "detecting" && restReminder.phase !== "resting" && restReminder.phase !== "triggered") {
      analyzer.updateMetrics(metrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, detectState, restReminder.phase]);

  // Handle alert triggers from analyzer
  useEffect(() => {
    if (analyzer.shouldAlert && analyzer.alertMessage) {
      showAlert(analyzer.alertMessage, "bad");
    }
  }, [analyzer.shouldAlert, analyzer.alertMessage, showAlert]);

  const handleStart = useCallback(async () => {
    // Reentrance guard: prevent double-start from rapid Space key or voice+click
    if (detectState !== "idle") return;
    initAudio();
    if (navigator.vibrate) navigator.vibrate(15);
    setShowCompletionBanner(false);
    // Optimistically set state to "detecting" to block concurrent starts during await
    setDetectState("detecting");
    const success = await startCamera();
    if (!success) {
      setDetectState("idle"); // Camera failed, revert to idle
      return;
    }
    startSession();
    analyzer.start();
  }, [startCamera, startSession, analyzer, detectState]);

  // Ref tracking whether detection was auto-paused by the pomodoro break phase.
  // Declared here (above the handlers) so handleResume can reset it. See the
  // pomodoro block further down for the auto-pause/auto-resume wiring.
  const pomodoroAutoPausedRef = useRef(false);

  const handlePause = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
    stopDetection();
    analyzer.pause();
    pauseSession();
    setDetectState("paused");
  }, [stopDetection, analyzer, pauseSession]);

  const handleResume = useCallback(async () => {
    // Don't call startDetection here — the effect at line ~196 handles it
    // when detectState transitions to "detecting"
    // Clear the pomodoro auto-paused flag so that a later phase change to
    // "focusing" won't auto-resume detection against the user's intent (e.g.
    // they manually resumed during a break and want to stay in control).
    pomodoroAutoPausedRef.current = false;
    analyzer.resume();
    resumeSession();
    setDetectState("detecting");
  }, [analyzer, resumeSession]);

  const handleStop = useCallback(() => {
    // Idempotency guard: prevent double-stop from rapid clicks or voice+click
    if (detectState === "idle") return;
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    // Capture current metrics from ref BEFORE stopping detection (which clears landmarks)
    const finalMetrics = { ...metricsRef.current };

    // 从 refs 获取最新统计数据（不依赖 React state）
    const stats = analyzer.finalize();

    stopDetection();
    stopCamera();
    analyzer.pause();

    // Use analyzer's totalDuration (actual detected time) for posture percentages,
    // NOT wall-clock time — this ensures good+warning+bad percentages sum to ~100%.
    // Wall-clock time is tracked separately via getElapsedTime() for display.
    const totalDetected = stats.totalDuration > 0 ? stats.totalDuration : 1;
    const finalStats = { ...stats, totalDuration: totalDetected };

    const summary = endSession({
      ...finalStats,
      metrics: {
        avgHeadTilt: finalMetrics.headTiltAngle,
        avgShoulderTilt: finalMetrics.shoulderTiltAngle,
        avgNeckForward: finalMetrics.neckForwardScore,
        avgSpineTilt: finalMetrics.spineTiltAngle,
      },
    });
    setSummaryDataLocal(summary);

    // Save session to localStorage
    // NOTE: `date` uses the END time's date (getTodayDate). For sessions that
    // span midnight this attributes the whole session to the end date rather
    // than splitting it across two days. This is acceptable for most use
    // cases; splitting would require a more complex session model.
    // startTime uses wall-clock elapsed time (includes pauses) for accurate
    // time range display in reports, while duration uses detected time only.
    const wallClockElapsed = getElapsedTime();
    const saved = saveSession({
      id: generateId(),
      date: getTodayDate(),
      startTime: Date.now() - wallClockElapsed * 1000,
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

    // Dispatch event so report page (if open or navigated to) refreshes data
    if (typeof window !== "undefined" && saved) {
      window.dispatchEvent(new CustomEvent("posture-sentinel:session-saved"));
    }

    setDetectState("idle");
    setShowSummary(true);
    setShowCompletionBanner(true);

    // Check for newly unlocked achievements after saving session
    setTimeout(() => {
      achievements.checkAndUnlock();
    }, 500);
  }, [stopDetection, stopCamera, analyzer, endSession, getElapsedTime, achievements]);

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

  // Beforeunload: warn + auto-save session data to prevent total loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (detectState === "detecting" || detectState === "paused") {
        // Auto-save partial session data before the tab closes
        try {
          const finalMetrics = { ...metricsRef.current };
          const stats = analyzer.finalize();
          const currentElapsed = getElapsedTime();
          const totalDetected = stats.totalDuration > 0 ? stats.totalDuration : 1;
          saveSession({
            id: generateId(),
            date: getTodayDate(),
            startTime: Date.now() - currentElapsed * 1000,
            endTime: Date.now(),
            duration: totalDetected,
            avgScore: stats.avgScore || 0,
            goodPercent: Math.round((stats.goodDuration / totalDetected) * 100),
            warningPercent: Math.round((stats.warningDuration / totalDetected) * 100),
            badPercent: Math.round((stats.badDuration / totalDetected) * 100),
            alertCount: stats.alertCount,
            scoreHistory: stats.scoreHistory,
            metrics: {
              avgHeadTilt: finalMetrics.headTiltAngle,
              avgShoulderTilt: finalMetrics.shoulderTiltAngle,
              avgNeckForward: finalMetrics.neckForwardScore,
              avgSpineTilt: finalMetrics.spineTiltAngle,
            },
          });
        } catch {
          // Best effort — if save fails, at least show the warning
        }
        e.preventDefault();
        e.returnValue = "检测正在进行中，确定要离开吗？当前会话数据将自动保存。";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [detectState, analyzer, getElapsedTime]);

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
  const [helpOpen, setHelpOpen] = useState(false);

  // Pomodoro focus timer — linked with detection:
  // break phase auto-pauses detection, focus phase auto-resumes
  // (pomodoroAutoPausedRef is declared above, near the detection handlers)
  const pomodoro = usePomodoro({
    focusMinutes: 25,
    breakMinutes: 5,
    onPhaseChange: (phase) => {
      if (phase === "break") {
        playPhaseChangeSound("break");
        // Auto-pause detection during break
        if (detectState === "detecting") {
          pomodoroAutoPausedRef.current = true;
          handlePause();
        }
      } else if (phase === "focusing") {
        playPhaseChangeSound("focus");
        // Auto-resume detection if we paused it
        if (pomodoroAutoPausedRef.current && detectState === "paused") {
          pomodoroAutoPausedRef.current = false;
          handleResume();
        }
      }
    },
  });

  // Voice commands (暂停/继续/结束/开始) — must be after handleStart/Stop etc.
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voice = useVoiceCommands({
    enabled: voiceEnabled,
    onStart: handleStart,
    onPause: handlePause,
    onResume: handleResume,
    onStop: handleStop,
  });

  // Handle baseline capture
  const handleBaselineCapture = useCallback((data: { headTilt: number; shoulderTilt: number; neckForward: number; spineTilt: number }) => {
    captureBaseline(data);
  }, [captureBaseline]);

  // Start camera for baseline sampling
  const handleStartBaselineSampling = useCallback(async () => {
    // 已经在正式检测/暂停中：摄像头和检测均已就绪，直接打开采样弹窗
    if (detectState !== "idle") {
      setShowBaselineSampling(true);
      return;
    }
    // 空闲状态：先启动摄像头，再打开采样弹窗
    const success = await startCamera();
    if (!success) return;
    setShowBaselineSampling(true);
  }, [startCamera, detectState]);

  // During baseline sampling in idle state, auto-start pose detection so that
  // real-time metrics are available for capture. When detection is already
  // running this effect is a no-op.
  useEffect(() => {
    if (showBaselineSampling && isActive && videoRef.current && !isDetecting && detectState === "idle") {
      startDetection(videoRef.current);
    }
  }, [showBaselineSampling, isActive, isDetecting, detectState, startDetection, videoRef]);

  // Close baseline sampling and stop camera/detection if not in an active session
  const handleCloseBaselineSampling = useCallback(() => {
    setShowBaselineSampling(false);
    if (detectState === "idle") {
      stopDetection();
      stopCamera();
    }
  }, [detectState, stopCamera, stopDetection]);

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light/10 to-transparent -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-4 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                实时坐姿检测
              </h1>
              <p className="text-text-secondary mt-1 text-sm">
                打开摄像头，AI 实时分析你的坐姿状态
              </p>
            </div>
            <VoiceIndicator
              isListening={voice.isListening}
              isSupported={voice.isSupported}
              lastCommand={voice.lastCommand}
              onToggle={() => setVoiceEnabled(v => !v)}
            />
          </div>
          {/* Pomodoro focus timer */}
          <div className="mt-3">
            <PomodoroTimer
              phase={pomodoro.phase}
              remaining={pomodoro.remaining}
              completedFocus={pomodoro.completedFocus}
              isRunning={pomodoro.isRunning}
              onStart={pomodoro.start}
              onPause={pomodoro.pause}
              onResume={pomodoro.resume}
              onSkip={pomodoro.skip}
              onStop={pomodoro.stop}
            />
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
              <button onClick={handleStart} className="bg-primary-dark hover:bg-primary text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                再测一次
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-stretch">
          {/* Camera area + controls (mobile: controls right below camera) */}
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
            {/* Controls — placed right below camera on all screen sizes */}
            <div className="mt-4">
              <DetectControls
                state={controlState}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                isLoading={isLoading}
                shortcutsDisabled={showSummary || showWizard || showBaselineSampling || helpOpen}
                onToggleHelp={() => setHelpOpen((v) => !v)}
                onTogglePomodoro={() => {
                  if (pomodoro.phase === "idle") pomodoro.start();
                  else if (pomodoro.isRunning) pomodoro.pause();
                  else if (pomodoro.phase === "paused") pomodoro.resume();
                }}
              />
              <p className="text-center text-xs text-text-muted mt-3">
                提示：坐姿持续不良超过 {settings.badPostureThreshold} 秒后会自动触发提醒
                {restReminder.settings.enabled && ` · 每 ${restReminder.settings.intervalMinutes} 分钟提醒休息`}
              </p>
              {/* Baseline calibration - promoted to visible secondary action */}
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleStartBaselineSampling}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    hasBaseline
                      ? "border-primary/30 bg-primary-light text-primary-text"
                      : "border-dashed border-primary/40 bg-primary-light/50 text-primary-text hover:bg-primary-light"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {hasBaseline ? "已校准 · 重新校准" : "校准个人姿态基线"}
                  {hasBaseline && (
                    <span className="inline-flex items-center gap-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已启用
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Metrics panel */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl p-5 md:p-6 h-full border border-border">
              <MetricsPanel
                metrics={metrics}
                fps={fps}
                sessionDuration={sessionState === "idle" ? 0 : elapsedTime}
                isDetecting={isDetecting}
                statusDuration={analyzer.statusDuration}
                currentStatus={analyzer.currentStatus}
                alertCount={analyzer.sessionStats.alertCount}
                scoreGauge={
                  <PostureGauge
                    score={metrics.overallScore}
                    isDetecting={isDetecting}
                    isDetected={metrics.isDetected}
                  />
                }
              />
            </div>
          </div>
        </div>

        {/* Posture Timeline - 实时姿态时间线 */}
        {(detectState === "detecting" || detectState === "paused") && (
          <div className="mt-4">
            {detectState === "paused" && (
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning-text text-xs font-medium px-3 py-1 rounded-full">
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

    {/* Keyboard shortcuts help overlay */}
    <KeyboardHelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />

    {/* Baseline sampling overlay */}
    {showBaselineSampling && (
      <BaselineSampling
        metrics={landmarks && landmarks.length > 0 ? {
          headTiltAngle: metrics.headTiltAngle,
          shoulderTiltAngle: metrics.shoulderTiltAngle,
          neckForwardScore: metrics.neckForwardScore,
          spineTiltAngle: metrics.spineTiltAngle,
        } : null}
        isActive={isActive}
        onCapture={handleBaselineCapture}
        onCancel={handleCloseBaselineSampling}
      />
    )}
    </ErrorBoundary>
  );
}