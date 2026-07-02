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
// Uses weighted average of two reliable indicators for front-facing webcam:
//
// A) Vertical ratio (weight 60%): (shoulderMidY - noseY) / shoulderWidth
//    When neck is pushed forward, the head drops toward shoulders, ratio decreases.
//    Good posture: ratio >= 0.45 | Forward neck: ratio <= 0.30
//    This is the most reliable indicator for a front-facing camera.
//
// B) Head pitch (weight 40%): nose vertical position relative to ear midpoint
//    Detects looking up (仰头) or looking down (低头) which often accompanies
//    forward neck posture.
//    Normal upright: pitchRatio ≈ 0.5-0.8 (nose below ears)
//    Looking up: pitchRatio < 0.35 (nose rises toward ear level)
//    Looking down: pitchRatio > 0.95 (nose drops further)
//
// NOTE: Previous version had two additional indicators (face-to-shoulder ratio
// and back-lean angle) that were unreliable and caused false positives.
// - Face ratio depends on camera distance and body proportions
// - Back-lean angle measured lateral nose displacement, not forward lean,
//   and its scoring was inverted (good posture scored worst)
function calculateNeckForwardScore(landmarks: NormalizedLandmark[], baseline?: { neckForward: number }): number {
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];

  if (!nose || !leftShoulder || !rightShoulder) return 0;

  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  const shoulderWidth = distance(leftShoulder, rightShoulder);
  if (shoulderWidth < 0.001) return 0;

  // ── Indicator A: vertical ratio (60% weight) ──
  // Ratio of nose-to-shoulder vertical gap to shoulder width.
  // Lower ratio = head dropped toward shoulders = forward neck.
  const verticalGap = shoulderMid.y - nose.y;
  const verticalRatio = verticalGap / shoulderWidth;

  // If baseline exists, center the thresholds around the baseline ratio
  const goodRatio = baseline ? Math.max(0.30, baseline.neckForward - 0.08) : 0.45;
  const badRatio = baseline ? Math.max(0.20, baseline.neckForward - 0.18) : 0.30;

  let verticalScore = 0;
  if (verticalRatio <= badRatio) {
    verticalScore = 100;
  } else if (verticalRatio >= goodRatio) {
    verticalScore = 0;
  } else {
    verticalScore = ((goodRatio - verticalRatio) / (goodRatio - badRatio)) * 100;
  }

  // ── Indicator B: head pitch (40% weight) ──
  // Uses nose vertical position relative to ear midpoint, normalized by ear distance.
  let headPitchScore = 0;
  if (leftEar && rightEar) {
    const earMid = getMidpoint(leftEar, rightEar);
    const earToNoseDy = nose.y - earMid.y; // positive = nose below ears (normal)
    const earDist = distance(leftEar, rightEar);
    if (earDist > 0.001) {
      const pitchRatio = earToNoseDy / earDist;

      // Normal upright: pitchRatio ≈ 0.5-0.8 (nose below ears)
      // Looking up (仰头): pitchRatio < 0.35 → head tilts back
      // Looking down (低头): pitchRatio > 0.95 → head tilts forward
      if (pitchRatio < 0.25) {
        headPitchScore = 100; // extreme looking up
      } else if (pitchRatio < 0.35) {
        headPitchScore = ((0.35 - pitchRatio) / (0.35 - 0.25)) * 100;
      } else if (pitchRatio <= 0.85) {
        headPitchScore = 0; // healthy range
      } else if (pitchRatio <= 1.1) {
        headPitchScore = ((pitchRatio - 0.85) / (1.1 - 0.85)) * 100;
      } else {
        headPitchScore = 100; // extreme looking down
      }
    }
  }

  // Weighted average: vertical ratio is primary, head pitch is secondary
  return Math.round(verticalScore * 0.6 + headPitchScore * 0.4);
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
  thresholds: PostureThresholds = DEFAULT_POSTURE_THRESHOLDS,
  baseline?: { headTilt: number; shoulderTilt: number; neckForward: number; spineTilt: number } | null
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
  const neckForwardScore = calculateNeckForwardScore(landmarks, baseline ?? undefined);
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
