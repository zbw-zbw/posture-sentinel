"use client";

import { useRef, useEffect } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { POSE_CONNECTIONS } from "@/lib/mediapipe-config";
import { PostureStatus } from "@/lib/posture";

interface SkeletonOverlayProps {
  landmarks: NormalizedLandmark[][] | null;
  status: PostureStatus;
  width: number;
  height: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  headTiltAngle: number;
  isActive: boolean;
}

const STATUS_COLORS: Record<PostureStatus, string> = {
  good: "#10b981",
  warning: "#f59e0b",
  bad: "#ef4444",
};

export default function SkeletonOverlay({
  landmarks,
  status,
  width,
  height,
  videoRef,
  headTiltAngle,
  isActive,
}: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef(0);
  const landmarksRef = useRef(landmarks);
  const statusRef = useRef(status);
  const headTiltRef = useRef(headTiltAngle);

  // Keep refs in sync with props (avoiding effect dependency on fast-changing data)
  landmarksRef.current = landmarks;
  statusRef.current = status;
  headTiltRef.current = headTiltAngle;

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);

      // Draw mirrored video frame at display refresh rate (smooth video)
      if (isActive && video.readyState >= 2) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      }

      // Draw skeleton overlay on top (at landmark update rate ~8Hz)
      const lms = landmarksRef.current;
      const color = STATUS_COLORS[statusRef.current];

      if (lms && lms.length > 0) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-width, 0);

        // Draw reference lines (faint guides)
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        const leftShoulder = lms[0][11];
        const rightShoulder = lms[0][12];
        if (leftShoulder && rightShoulder) {
          const shoulderMidX = ((leftShoulder.x + rightShoulder.x) / 2) * width;
          ctx.beginPath();
          ctx.moveTo(shoulderMidX, 0);
          ctx.lineTo(shoulderMidX, height);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Draw connections — batch shadow to reduce GPU overhead
        ctx.shadowColor = color;
        ctx.shadowBlur = 3;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        for (const [start, end] of POSE_CONNECTIONS) {
          const a = lms[0][start];
          const b = lms[0][end];
          if (!a || !b) continue;
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Draw keypoints — batch all dots then stroke all outlines
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        const keyIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
        for (const i of keyIndices) {
          const lm = lms[0][i];
          if (!lm) continue;
          ctx.beginPath();
          ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
        // White outlines without shadow (cheaper — single pass)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        for (const i of keyIndices) {
          const lm = lms[0][i];
          if (!lm) continue;
          ctx.beginPath();
          ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw ear-to-ear reference line
        const leftEar = lms[0][7];
        const rightEar = lms[0][8];
        if (leftEar && rightEar) {
          const tilt = headTiltRef.current;
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = tilt <= 5 ? "#10b981" : tilt <= 10 ? "#f59e0b" : "#ef4444";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(leftEar.x * width, leftEar.y * height);
          ctx.lineTo(rightEar.x * width, rightEar.y * height);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }

        ctx.restore();

        // Draw angle text AFTER restore (un-mirrored)
        const lms0 = lms[0];
        const le = lms0[7];
        const re = lms0[8];
        if (le && re) {
          const tilt = headTiltRef.current;
          const earMidX = (1 - (le.x + re.x) / 2) * width;
          const earMidY = ((le.y + re.y) / 2) * height;
          const angleText = `${Math.round(tilt)}°`;
          const angleColor = tilt <= 8 ? "#10b981" : tilt <= 15 ? "#f59e0b" : "#ef4444";

          ctx.fillStyle = "rgba(0,0,0,0.6)";
          const tw = ctx.measureText(angleText).width;
          ctx.beginPath();
          ctx.roundRect(earMidX - tw / 2 - 8, earMidY - 28, tw + 16, 20, 10);
          ctx.fill();

          ctx.fillStyle = angleColor;
          ctx.font = "bold 13px var(--font-sans, system-ui, sans-serif)";
          ctx.textAlign = "center";
          ctx.fillText(angleText, earMidX, earMidY - 14);
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, videoRef, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full rounded-2xl"
      style={{ objectFit: "cover" }}
    />
  );
}
