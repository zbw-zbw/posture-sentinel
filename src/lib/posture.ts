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

// Helper: angle of a line from vertical, in degrees (0 = perfectly vertical)
// top is the upper point (smaller y in screen coords), bottom is the lower point
// Returns 0-90 degrees representing deviation from vertical
function angleFromVertical(top: {x:number,y:number}, bottom: {x:number,y:number}): number {
  const dx = top.x - bottom.x;
  // In MediaPipe screen coords, y increases downward.
  // top.y < bottom.y for normal upright posture, so dy > 0.
  // Use Math.abs to handle edge cases.
  const dy = Math.abs(bottom.y - top.y);
  if (dy < 0.001) return 0; // Avoid division by near-zero
  return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
}

// 1. calculateHeadForwardAngle
// Nose position relative to shoulder midpoint, angle from vertical
// This measures how far forward the head is relative to the shoulders
export function calculateHeadForwardAngle(landmarks: NormalizedLandmark[]): number {
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  if (!nose || !leftShoulder || !rightShoulder) return 0;
  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  return angleFromVertical(nose, shoulderMid);
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
// Angle between shoulder midpoint -> hip midpoint line and vertical
// Measures lateral/forward lean of the upper body
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

// Linear interpolation scoring: 100 at goodThreshold, 0 at badThreshold
function metricScore(value: number, goodThreshold: number, badThreshold: number): number {
  if (value <= goodThreshold) return 100;
  if (value >= badThreshold) return 0;
  // Linear interpolation between good and bad
  const ratio = (value - goodThreshold) / (badThreshold - goodThreshold);
  return Math.round(100 - ratio * 100);
}

// 5. calculateOverallScore + status
export function calculateOverallScore(landmarks: NormalizedLandmark[]): PostureMetrics {
  const headAngle = calculateHeadForwardAngle(landmarks);
  const shoulderSym = calculateShoulderSymmetry(landmarks);
  const forwardLean = calculateForwardLean(landmarks);
  const spineAngle = calculateSpineAngle(landmarks);

  // Use linear scoring with "bad" thresholds doubled from warning for smooth degradation
  const headScore = metricScore(headAngle, POSTURE_THRESHOLDS.headForward.good, 30);
  const shoulderScore = metricScore(100 - shoulderSym, 100 - POSTURE_THRESHOLDS.shoulderSymmetry.good, 35);
  const leanScore = metricScore(forwardLean, POSTURE_THRESHOLDS.forwardLean.good, 15);
  const spineScore = metricScore(spineAngle, POSTURE_THRESHOLDS.spineAngle.good, 45);

  const overall = Math.round(
    headScore * SCORE_WEIGHTS.headForward +
    shoulderScore * SCORE_WEIGHTS.shoulderSymmetry +
    leanScore * SCORE_WEIGHTS.forwardLean +
    spineScore * SCORE_WEIGHTS.spineAngle
  );

  // Status is based on the worst individual metric, not the weighted average
  const worstMetric = Math.min(headScore, shoulderScore, leanScore, spineScore);
  let status: PostureStatus = "good";
  if (worstMetric < 40) status = "bad";
  else if (worstMetric < 70) status = "warning";

  return {
    headForwardAngle: Math.round(headAngle * 10) / 10,
    shoulderSymmetry: Math.round(shoulderSym * 10) / 10,
    forwardLean: Math.round(forwardLean * 10) / 10,
    spineAngle: Math.round(spineAngle * 10) / 10,
    overallScore: overall,
    status,
  };
}
