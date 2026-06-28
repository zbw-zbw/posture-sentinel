import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type PostureStatus = "good" | "warning" | "bad";

export interface PostureMetrics {
  headTiltAngle: number;      // 头部倾斜（度），ear-to-ear line from horizontal, 0=level
  shoulderTiltAngle: number;  // 肩膀倾斜（度），shoulder line from horizontal, 0=level
  neckForwardScore: number;   // 脖子前倾程度（0-100），0=正常，越高越严重
  spineTiltAngle: number;     // 脊椎倾斜（度），shoulder-to-hip from vertical, 0=straight
  overallScore: number;       // 总评分（0-100），越高越好
  status: PostureStatus;
  isDetected: boolean;
}

interface Point {
  x: number;
  y: number;
}

function getMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Angle of a line between two points from the horizontal axis (0° = level, 90° = vertical)
// Always returns 0-90° as the "tilt" from horizontal
function tiltFromHorizontal(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
  // Normalize to 0-90°: 0 = perfectly horizontal, 90 = perfectly vertical
  return angle > 90 ? 180 - angle : angle;
}

// Angle of a line between two points from the vertical axis (0° = straight up, 90° = horizontal)
function tiltFromVertical(top: Point, bottom: Point): number {
  const dx = top.x - bottom.x;
  const dy = Math.abs(bottom.y - top.y);
  if (dy < 0.001) return 0;
  return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
}

// ── Metric 1: Head Tilt ──
// Uses ear-to-ear line angle from horizontal.
// When head is upright, ears are level → angle ≈ 0°.
// When head tilts sideways (歪头), angle increases.
function calculateHeadTiltAngle(landmarks: NormalizedLandmark[]): number {
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  if (!leftEar || !rightEar) return 0;
  return tiltFromHorizontal(leftEar, rightEar);
}

// ── Metric 2: Shoulder Tilt ──
// Uses shoulder-to-shoulder line angle from horizontal.
// When shoulders are level → angle ≈ 0°.
// When one shoulder is higher (耸肩/倾斜), angle increases.
function calculateShoulderTiltAngle(landmarks: NormalizedLandmark[]): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  if (!leftShoulder || !rightShoulder) return 0;
  return tiltFromHorizontal(leftShoulder, rightShoulder);
}

// ── Metric 3: Forward Neck Score (0-100, higher = worse) ──
// Combines two indicators for front-facing webcam:
//
// A) Vertical ratio: (shoulderMidY - noseY) / shoulderWidth
//    When neck is pushed forward, the head drops toward shoulders, ratio decreases.
//    Good posture: ratio > 0.50 | Forward neck: ratio < 0.35
//
// B) Face-to-shoulder ratio: earDist / shoulderWidth
//    When head moves forward (closer to camera), face appears larger.
//    Good posture: ratio < 0.45 | Forward neck: ratio > 0.55
function calculateNeckForwardScore(landmarks: NormalizedLandmark[]): number {
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];

  if (!nose || !leftShoulder || !rightShoulder) return 0;

  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  const shoulderWidth = distance(leftShoulder, rightShoulder);
  if (shoulderWidth < 0.001) return 0;

  // Indicator A: vertical ratio
  const verticalGap = shoulderMid.y - nose.y;
  const verticalRatio = verticalGap / shoulderWidth;

  let verticalScore = 0;
  if (verticalRatio <= 0.35) {
    verticalScore = 100;
  } else if (verticalRatio >= 0.50) {
    verticalScore = 0;
  } else {
    verticalScore = ((0.50 - verticalRatio) / (0.50 - 0.35)) * 100;
  }

  // Indicator B: face-to-shoulder ratio
  let faceScore = 0;
  if (leftEar && rightEar) {
    const earDist = distance(leftEar, rightEar);
    const faceRatio = earDist / shoulderWidth;
    if (faceRatio >= 0.58) {
      faceScore = 100;
    } else if (faceRatio <= 0.45) {
      faceScore = 0;
    } else {
      faceScore = ((faceRatio - 0.45) / (0.58 - 0.45)) * 100;
    }
  }

  // Take the worse (higher) of the two indicators
  return Math.max(verticalScore, faceScore);
}

// ── Metric 4: Spine Tilt ──
// Uses shoulder-midpoint to hip-midpoint line angle from vertical.
// When sitting straight → angle ≈ 0°.
// When leaning sideways → angle increases.
function calculateSpineTiltAngle(landmarks: NormalizedLandmark[]): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 0;
  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  const hipMid = getMidpoint(leftHip, rightHip);
  return tiltFromVertical(shoulderMid, hipMid);
}

// ── Scoring helpers ──

// Convert a "badness" metric (lower = better) to a 0-100 score (higher = better)
function scoreFromBadness(value: number, goodThreshold: number, badThreshold: number): number {
  if (value <= goodThreshold) return 100;
  if (value >= badThreshold) return 0;
  return Math.round(100 * (1 - (value - goodThreshold) / (badThreshold - goodThreshold)));
}

export function analyzePosture(landmarks: NormalizedLandmark[]): PostureMetrics {
  // Check if essential landmarks are visible
  const requiredIndices = [0, 7, 8, 11, 12, 23, 24];
  const isDetected = requiredIndices.every(
    (i) =>
      landmarks[i] &&
      (landmarks[i].visibility === undefined || landmarks[i].visibility > 0.3)
  );

  if (!isDetected) {
    return {
      headTiltAngle: 0,
      shoulderTiltAngle: 0,
      neckForwardScore: 0,
      spineTiltAngle: 0,
      overallScore: 0,
      status: "good",
      isDetected: false,
    };
  }

  const headTiltAngle = calculateHeadTiltAngle(landmarks);
  const shoulderTiltAngle = calculateShoulderTiltAngle(landmarks);
  const neckForwardScore = calculateNeckForwardScore(landmarks);
  const spineTiltAngle = calculateSpineTiltAngle(landmarks);

  // Individual scores (0-100, higher = better posture)
  // Head tilt: good < 5°, bad > 15°
  const headScore = scoreFromBadness(headTiltAngle, 5, 15);
  // Shoulder tilt: good < 3°, bad > 8°
  const shoulderScore = scoreFromBadness(shoulderTiltAngle, 3, 8);
  // Forward neck: good < 20, bad > 60 (on the 0-100 severity scale)
  const neckScore = scoreFromBadness(neckForwardScore, 20, 60);
  // Spine tilt: good < 5°, bad > 15°
  const spineScore = scoreFromBadness(spineTiltAngle, 5, 15);

  // Overall score: weighted average
  const overallScore = Math.round(
    headScore * 0.30 +
      shoulderScore * 0.20 +
      neckScore * 0.30 +
      spineScore * 0.20
  );

  // Status based on worst metric (sensitive to any single bad metric)
  const worstScore = Math.min(headScore, shoulderScore, neckScore, spineScore);
  let status: PostureStatus = "good";
  if (worstScore < 50) status = "bad";
  else if (worstScore < 80) status = "warning";

  return {
    headTiltAngle: Math.round(headTiltAngle * 10) / 10,
    shoulderTiltAngle: Math.round(shoulderTiltAngle * 10) / 10,
    neckForwardScore: Math.round(neckForwardScore),
    spineTiltAngle: Math.round(spineTiltAngle * 10) / 10,
    overallScore,
    status,
    isDetected: true,
  };
}
