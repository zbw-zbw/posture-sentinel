import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type PostureStatus = "good" | "warning" | "bad";

export interface PostureThresholds {
  headAngle: { warning: number; bad: number };
  shoulder: { warning: number; bad: number };
  spineAngle: { warning: number; bad: number };
}

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
// Combines multiple indicators for front-facing webcam:
//
// A) Vertical ratio: (shoulderMidY - noseY) / shoulderWidth
//    When neck is pushed forward, the head drops toward shoulders, ratio decreases.
//    Good posture: ratio > 0.50 | Forward neck: ratio < 0.35
//
// B) Face-to-shoulder ratio: earDist / shoulderWidth
//    When head moves forward (closer to camera), face appears larger.
//    Good posture: ratio < 0.45 | Forward neck: ratio > 0.55
//
// C) Back lean: nose-to-shoulder angle (后仰/过度前倾)
//
// D) Head pitch: nose vs forehead vertical position (仰头/低头)
//    Uses landmark 0 (nose) vs landmark 10 (forehead midpoint area)
//    Good posture: forehead is above nose (both at similar height)
//    Looking up (仰头): head tilts back, forehead rises relative to nose
//    Looking down (低头): head tilts forward, nose drops relative to chin
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

  // Indicator C: nose-to-shoulder midpoint angle from vertical
  let backLeanScore = 0;
  const noseAngle = Math.abs(Math.atan2(
    shoulderMid.x - nose.x,
    nose.y - shoulderMid.y
  ) * (180 / Math.PI));

  if (noseAngle <= 3) {
    backLeanScore = 100;
  } else if (noseAngle >= 10) {
    backLeanScore = 0;
  } else {
    backLeanScore = ((10 - noseAngle) / (10 - 3)) * 100;
  }

  // Indicator D: Head pitch — detect looking up (仰头) or looking down (低头)
  // Use the vertical position of the nose relative to the midpoint of both ears
  // When looking up, the nose drops below the ear midpoint (nose.y > earMid.y increases)
  // When looking down, the nose rises above the ear midpoint
  let headPitchScore = 0;
  if (leftEar && rightEar) {
    const earMid = getMidpoint(leftEar, rightEar);
    const earToNoseDy = nose.y - earMid.y; // positive = nose below ears (normal)
    const earDist = distance(leftEar, rightEar);
    // Normalize by ear distance for scale-invariance
    const pitchRatio = earToNoseDy / earDist;

    // Normal upright: pitchRatio ≈ 0.6-0.9 (nose below ears)
    // Looking up (仰头): pitchRatio drops significantly (< 0.4) because nose moves closer to ear level
    // Looking down (低头): pitchRatio increases (> 1.0) because nose drops further below
    if (pitchRatio < 0.3) {
      headPitchScore = 100; // extreme looking up
    } else if (pitchRatio <= 0.45) {
      headPitchScore = ((0.45 - pitchRatio) / (0.45 - 0.3)) * 100;
    } else if (pitchRatio <= 0.55) {
      headPitchScore = 0; // healthy range
    } else if (pitchRatio <= 0.75) {
      headPitchScore = 0; // slightly looking down, still ok
    } else if (pitchRatio <= 1.0) {
      headPitchScore = ((pitchRatio - 0.75) / (1.0 - 0.75)) * 100;
    } else {
      headPitchScore = 100; // extreme looking down
    }
  }

  // Take the worse (higher) of the four indicators
  return Math.max(verticalScore, faceScore, backLeanScore, headPitchScore);
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

export const DEFAULT_POSTURE_THRESHOLDS: PostureThresholds = {
  headAngle: { warning: 5, bad: 15 },
  shoulder: { warning: 3, bad: 8 },
  spineAngle: { warning: 5, bad: 15 },
};

export function analyzePosture(
  landmarks: NormalizedLandmark[],
  thresholds: PostureThresholds = DEFAULT_POSTURE_THRESHOLDS
): PostureMetrics {
  // Check if essential landmarks exist and have valid coordinates.
  // Note: MediaPipe pose_landmarker_lite often returns visibility=0 or undefined
  // even when landmarks are clearly detected, so we do NOT use visibility threshold.
  // We only require that the landmark object exists with valid x,y coordinates.
  const hasValidLandmark = (i: number): boolean => {
    const lm = landmarks[i];
    if (!lm) return false;
    if (typeof lm.x !== "number" || typeof lm.y !== "number") return false;
    // Sanity check: coordinates should be in normalized [0, 1] range
    if (lm.x < -0.1 || lm.x > 1.1 || lm.y < -0.1 || lm.y > 1.1) return false;
    return true;
  };

  // Core landmarks needed for head + shoulder metrics (upper body)
  const coreIndices = [0, 11, 12]; // nose, left shoulder, right shoulder
  const coreDetected = coreIndices.every(hasValidLandmark);

  // Hip landmarks are needed for spine tilt, but may be off-screen in close-up shots
  const hipIndices = [23, 24]; // left hip, right hip
  const hipsDetected = hipIndices.every(hasValidLandmark);

  // Ear landmarks for head tilt (may occasionally be occluded)
  const earIndices = [7, 8];
  const earsDetected = earIndices.every(hasValidLandmark);

  if (!coreDetected) {
    // Can't do anything without nose and shoulders
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

  // Compute metrics, using 0 for unavailable ones
  const headTiltAngle = earsDetected ? calculateHeadTiltAngle(landmarks) : 0;
  const shoulderTiltAngle = calculateShoulderTiltAngle(landmarks);
  const neckForwardScore = calculateNeckForwardScore(landmarks);
  const spineTiltAngle = hipsDetected ? calculateSpineTiltAngle(landmarks) : 0;

  // Individual scores (0-100, higher = better posture)
  // Head tilt (only scored if ears detected)
  const headScore = earsDetected
    ? scoreFromBadness(headTiltAngle, thresholds.headAngle.warning, thresholds.headAngle.bad)
    : 100;
  // Shoulder tilt
  const shoulderScore = scoreFromBadness(shoulderTiltAngle, thresholds.shoulder.warning, thresholds.shoulder.bad);
  // Forward neck (good < 20, bad > 60 on the 0-100 severity scale)
  const neckScore = scoreFromBadness(neckForwardScore, 20, 60);
  // Spine tilt (only scored if hips detected)
  const spineScore = hipsDetected
    ? scoreFromBadness(spineTiltAngle, thresholds.spineAngle.warning, thresholds.spineAngle.bad)
    : 100;

  // Overall score: weighted average (redistribute weights for unavailable metrics)
  const weights = { head: 0.30, shoulder: 0.20, neck: 0.30, spine: 0.20 };
  const totalWeight =
    (earsDetected ? weights.head : 0) +
    weights.shoulder +
    weights.neck +
    (hipsDetected ? weights.spine : 0);
  const overallScore = Math.round(
    (headScore * (earsDetected ? weights.head : 0) +
      shoulderScore * weights.shoulder +
      neckScore * weights.neck +
      spineScore * (hipsDetected ? weights.spine : 0)) / totalWeight
  );

  // Status based on worst available metric
  const availableScores: number[] = [shoulderScore, neckScore];
  if (earsDetected) availableScores.push(headScore);
  if (hipsDetected) availableScores.push(spineScore);
  const worstScore = Math.min(...availableScores);
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
