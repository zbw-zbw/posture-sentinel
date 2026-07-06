"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COLORS } from "@/lib/colors";

// Posture states: good → warning → bad → warning → good (loop)
const POSTURE_STATES = [
  { name: "良好", score: 92, headOffsetX: 0, headOffsetY: 0, shoulderTilt: 0, spineCurve: 0, color: COLORS.primary },
  { name: "良好", score: 88, headOffsetX: 2, headOffsetY: -2, shoulderTilt: 1, spineCurve: 1, color: COLORS.primary },
  { name: "注意", score: 68, headOffsetX: 8, headOffsetY: -8, shoulderTilt: 3, spineCurve: 5, color: COLORS.warning },
  { name: "不良", score: 35, headOffsetX: 18, headOffsetY: -18, shoulderTilt: 6, spineCurve: 12, color: COLORS.danger },
  { name: "不良", score: 30, headOffsetX: 22, headOffsetY: -20, shoulderTilt: 8, spineCurve: 15, color: COLORS.danger },
  { name: "注意", score: 55, headOffsetX: 12, headOffsetY: -10, shoulderTilt: 4, spineCurve: 8, color: COLORS.warning },
  { name: "良好", score: 85, headOffsetX: 3, headOffsetY: -3, shoulderTilt: 1, spineCurve: 2, color: COLORS.primary },
  { name: "良好", score: 92, headOffsetX: 0, headOffsetY: 0, shoulderTilt: 0, spineCurve: 0, color: COLORS.primary },
];

const FRAME_DURATION = 1200; // ms per posture state
const TRANSITION_DURATION = 800; // ms for interpolation

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function HeroDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLabel, setCurrentLabel] = useState<{ name: string; score: number; color: string }>({ name: "良好", score: 92, color: COLORS.primary });
  const stateIndexRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive sizing: use container width, maintain 280x320 base aspect
    const container = canvas.parentElement;
    let w = 280;
    let h = 320;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      if (!container) return;
      const containerW = container.clientWidth;
      w = Math.min(containerW, 300);
      h = Math.round(w * (320 / 280));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (container) ro.observe(container);

    let running = true;
    let paused = false;
    let startTime = performance.now();
    let pausedElapsed = 0; // elapsed time at pause moment
    let rafId = 0;

    // draw is declared before the IntersectionObserver so the IO callback
    // can (re)start the loop on resume.
    const draw = (now: number) => {
      if (!running) return;
      if (paused) {
        // Paused: do NOT schedule another frame. The loop stops here and is
        // restarted by the IntersectionObserver resume branch below.
        return;
      }

      const elapsed = now - startTime;
      const totalCycle = POSTURE_STATES.length * FRAME_DURATION;
      const cycleTime = elapsed % totalCycle;

      const rawIndex = cycleTime / FRAME_DURATION;
      const fromIdx = Math.floor(rawIndex) % POSTURE_STATES.length;
      const toIdx = (fromIdx + 1) % POSTURE_STATES.length;
      const t = easeInOut(Math.min((rawIndex % 1) * (FRAME_DURATION / TRANSITION_DURATION), 1));

      const from = POSTURE_STATES[fromIdx];
      const to = POSTURE_STATES[toIdx];

      // Interpolate posture params
      const headX = lerp(from.headOffsetX, to.headOffsetX, t);
      const headY = lerp(from.headOffsetY, to.headOffsetY, t);
      const sTilt = lerp(from.shoulderTilt, to.shoulderTilt, t);
      const sCurve = lerp(from.spineCurve, to.spineCurve, t);
      const score = Math.round(lerp(from.score, to.score, t));

      // Determine current display label
      const idx = Math.round(rawIndex) % POSTURE_STATES.length;
      const curState = POSTURE_STATES[idx];

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, COLORS.heroBgDark);
      grad.addColorStop(1, COLORS.heroBgMid);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 16);
      ctx.fill();

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let y = 40; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 20, y); ctx.stroke();
      }
      for (let x = 40; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, h - 20); ctx.stroke();
      }

      // Skeleton drawing
      const cx = w / 2;
      const baseY = 60;

      // Head
      const headCX = cx + headX;
      const headCY = baseY + headY;
      ctx.strokeStyle = curState.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = curState.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(headCX, headCY, 22, 26, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Neck
      const neckTop = headCY + 26;
      const neckBot = neckTop + 25;
      ctx.beginPath();
      ctx.moveTo(headCX, neckTop);
      ctx.lineTo(cx, neckBot);
      ctx.stroke();

      // Shoulders
      const shoulderY = neckBot + 5;
      const shoulderWidth = 55;
      const lShoulderX = cx - shoulderWidth - sTilt * 2;
      const rShoulderX = cx + shoulderWidth + sTilt * 2;
      ctx.beginPath();
      ctx.moveTo(lShoulderX, shoulderY);
      ctx.quadraticCurveTo(cx, shoulderY + 10, rShoulderX, shoulderY);
      ctx.stroke();

      // Spine
      const spineTop = neckBot;
      const spineBot = spineTop + 140;
      ctx.beginPath();
      ctx.moveTo(cx, spineTop);
      ctx.quadraticCurveTo(cx + sCurve * 0.8, spineTop + 70, cx + sCurve * 0.3, spineBot);
      ctx.stroke();

      // Pelvis
      ctx.beginPath();
      ctx.moveTo(cx + sCurve * 0.3 - 25, spineBot);
      ctx.lineTo(cx + sCurve * 0.3 + 25, spineBot);
      ctx.stroke();

      // Arms
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lShoulderX, shoulderY);
      ctx.quadraticCurveTo(lShoulderX - 15, shoulderY + 60, lShoulderX - 10, shoulderY + 110);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rShoulderX, shoulderY);
      ctx.quadraticCurveTo(rShoulderX + 15, shoulderY + 60, rShoulderX + 10, shoulderY + 110);
      ctx.stroke();

      // Keypoints
      ctx.shadowBlur = 12;
      const points = [
        [headCX, headCY], [cx, neckTop + 12], [lShoulderX, shoulderY],
        [rShoulderX, shoulderY], [cx + sCurve * 0.4, spineTop + 50],
        [cx + sCurve * 0.3, spineBot],
      ];
      for (const [px, py] of points) {
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = curState.color;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Reference line (vertical center)
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, baseY - 20);
      ctx.lineTo(cx, spineBot + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Score badge
      const badgeY = h - 38;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.roundRect(cx - 48, badgeY - 14, 96, 28, 14);
      ctx.fill();

      ctx.fillStyle = curState.color;
      ctx.font = "bold 16px Raleway, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${score}`, cx, badgeY);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px Raleway, system-ui, sans-serif";
      ctx.fillText("/100", cx + 22, badgeY);

      // Update React state for label display (throttled)
      if (Math.floor(elapsed / FRAME_DURATION) !== stateIndexRef.current) {
        stateIndexRef.current = Math.floor(elapsed / FRAME_DURATION);
        setCurrentLabel({ name: curState.name, score: curState.score, color: curState.color });
      }

      rafId = requestAnimationFrame(draw);
    };

    // Pause RAF when offscreen to save battery
    const io = new IntersectionObserver(
      (entries) => {
        const wasPaused = paused;
        paused = !entries[0]?.isIntersecting;
        if (wasPaused && !paused) {
          // Resuming: adjust startTime to account for paused duration, then
          // restart the RAF loop (it was stopped when we paused).
          startTime = performance.now() - pausedElapsed;
          rafId = requestAnimationFrame(draw);
        } else if (!wasPaused && paused) {
          // Pausing: capture current elapsed and cancel the pending frame so
          // the loop doesn't keep running (and doesn't double-schedule on resume).
          pausedElapsed = performance.now() - startTime;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.1 }
    );
    io.observe(canvas);

    rafId = requestAnimationFrame(draw);
    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="rounded-2xl shadow-2xl shadow-primary/10"
        style={{ maxWidth: "100%" }}
      />
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full transition-colors duration-500"
          style={{ backgroundColor: currentLabel.color }}
        />
        <span
          className="text-sm font-semibold transition-colors duration-500"
          style={{ color: currentLabel.color }}
        >
          {currentLabel.name === "良好" ? "坐姿良好" : currentLabel.name === "注意" ? "轻微偏移" : "请注意坐姿"}
        </span>
        <span className="text-xs text-text-muted ml-1">AI 实时分析演示</span>
      </div>
    </div>
  );
}
