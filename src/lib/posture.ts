import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { POSTURE_THRESHOLDS, SCORE_WEIGHTS } from "./mediapipe-config";

export type PostureStatus = "good" | "warning" | "bad";

export interface PostureMetrics {
  headForwardAngle: number;
  shoulderSymmetry: number;
  forwardLean: number;
  spineAngle: number;
  overallScore: number;
  status: PostureStatus;
}

// Helper: get midpoint between two landmarks
function getMidpoint(a: NormalizedLandmark, b: NormalizedLandmark) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

// Helper: angle between two points in degrees (from vertical)
function angleFromVertical(top: {x:number,y:number}, bottom: {x:number,y:number}): number {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y; // y increases downward in screen coords
  return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
}

// 1. calculateHeadForwardAngle
// Ear midpoint to shoulder midpoint, angle from vertical
export function calculateHeadForwardAngle(landmarks: NormalizedLandmark[]): number {
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  if (!leftEar || !rightEar || !leftShoulder || !rightShoulder) return 0;
  const earMid = getMidpoint(leftEar, rightEar);
  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  return angleFromVertical(earMid, shoulderMid);
}

// 2. calculateShoulderSymmetry
// 1 - abs(leftY - rightY) / max(leftY, rightY), as percentage
export function calculateShoulderSymmetry(landmarks: NormalizedLandmark[]): number {
  const left = landmarks[11];
  const right = landmarks[12];
  if (!left || !right) return 100;
  const diff = Math.abs(left.y - right.y);
  const maxY = Math.max(left.y, right.y);
  if (maxY === 0) return 100;
  return Math.max(0, Math.min(100, (1 - diff / maxY) * 100));
}

// 3. calculateForwardLean
// Nose x offset from hip midpoint x, normalized, scaled by 100 for display
export function calculateForwardLean(landmarks: NormalizedLandmark[]): number {
  const nose = landmarks[0];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  if (!nose || !leftHip || !rightHip) return 0;
  const hipMid = getMidpoint(leftHip, rightHip);
  return Math.abs(nose.x - hipMid.x) * 100;
}

// 4. calculateSpineAngle
// Deviation from 180° of shoulder-hip line vs nose-shoulder line
// Actually simpler: angle between (shoulder midpoint -> hip midpoint) vertical deviation
export function calculateSpineAngle(landmarks: NormalizedLandmark[]): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 0;
  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  const hipMid = getMidpoint(leftHip, rightHip);
  return angleFromVertical(shoulderMid, hipMid);
}

// 5. calculateOverallScore + status
export function calculateOverallScore(landmarks: NormalizedLandmark[]): PostureMetrics {
  const headAngle = calculateHeadForwardAngle(landmarks);
  const shoulderSym = calculateShoulderSymmetry(landmarks);
  const forwardLean = calculateForwardLean(landmarks);
  const spineAngle = calculateSpineAngle(landmarks);

  // Map each metric to 0-100 score
  const headScore = headAngle <= POSTURE_THRESHOLDS.headForward.good
    ? 100
    : headAngle <= POSTURE_THRESHOLDS.headForward.warning
    ? 70
    : 30;

  const shoulderScore = shoulderSym >= POSTURE_THRESHOLDS.shoulderSymmetry.good
    ? 100
    : shoulderSym >= POSTURE_THRESHOLDS.shoulderSymmetry.warning
    ? 60
    : 20;

  const leanScore = forwardLean <= POSTURE_THRESHOLDS.forwardLean.good
    ? 100
    : forwardLean <= POSTURE_THRESHOLDS.forwardLean.warning
    ? 65
    : 25;

  const spineScore = spineAngle <= POSTURE_THRESHOLDS.spineAngle.good
    ? 100
    : spineAngle <= POSTURE_THRESHOLDS.spineAngle.warning
    ? 60
    : 20;

  const overall = Math.round(
    headScore * SCORE_WEIGHTS.headForward +
    shoulderScore * SCORE_WEIGHTS.shoulderSymmetry +
    leanScore * SCORE_WEIGHTS.forwardLean +
    spineScore * SCORE_WEIGHTS.spineAngle
  );

  let status: PostureStatus = "good";
  if (overall < 60) status = "bad";
  else if (overall < 80) status = "warning";

  return {
    headForwardAngle: Math.round(headAngle * 10) / 10,
    shoulderSymmetry: Math.round(shoulderSym * 10) / 10,
    forwardLean: Math.round(forwardLean * 10) / 10,
    spineAngle: Math.round(spineAngle * 10) / 10,
    overallScore: overall,
    status,
  };
}
