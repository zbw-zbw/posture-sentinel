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
}

const STATUS_COLORS: Record<PostureStatus, string> = {
  good: "#10b981",
  warning: "#f59e0b",
  bad: "#ef4444",
};

export default function SkeletonOverlay({ landmarks, status, width, height, videoRef, headTiltAngle }: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the canvas to match mirrored video
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    // Draw mirrored video frame
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, width, height);
    }

    if (landmarks && landmarks.length > 0) {
      const lms = landmarks[0];
      const color = STATUS_COLORS[status];

      // Draw reference lines (faint guides)
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical center reference line (through shoulder midpoint)
      const leftShoulder = lms[11];
      const rightShoulder = lms[12];
      if (leftShoulder && rightShoulder) {
        const shoulderMidX = ((leftShoulder.x + rightShoulder.x) / 2) * width;
        ctx.beginPath();
        ctx.moveTo(shoulderMidX, 0);
        ctx.lineTo(shoulderMidX, height);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Draw connections
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      for (const [start, end] of POSE_CONNECTIONS) {
        const a = lms[start];
        const b = lms[end];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Draw keypoints
      ctx.globalAlpha = 0.9;
      const keyIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
      for (const i of keyIndices) {
        const lm = lms[i];
        if (!lm) continue;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw head tilt angle annotation near ears
      const leftEar = lms[7];
      const rightEar = lms[8];
      if (leftEar && rightEar) {
        const earMidX = ((leftEar.x + rightEar.x) / 2) * width;
        const earMidY = ((leftEar.y + rightEar.y) / 2) * height;
        const angleText = `${Math.round(headTiltAngle)}°`;
        const angleColor = headTiltAngle <= 5 ? "#10b981" : headTiltAngle <= 10 ? "#f59e0b" : "#ef4444";

        // Background pill
        const textWidth = ctx.measureText(angleText).width;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.roundRect(earMidX - textWidth / 2 - 8, earMidY - 28, textWidth + 16, 20, 10);
        ctx.fill();

        ctx.fillStyle = angleColor;
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(angleText, earMidX, earMidY - 14);
      }

      // Draw ear-to-ear reference line (shows head tilt visually)
      if (leftEar && rightEar) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = headTiltAngle <= 5 ? "#10b981" : headTiltAngle <= 10 ? "#f59e0b" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(leftEar.x * width, leftEar.y * height);
        ctx.lineTo(rightEar.x * width, rightEar.y * height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }, [landmarks, status, width, height, videoRef, headTiltAngle]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full rounded-xl"
      style={{ objectFit: "cover" }}
    />
  );
}
