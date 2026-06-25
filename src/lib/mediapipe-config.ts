export const MEDIAPIPE_CONFIG = {
  modelAssetPath:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  runningMode: "VIDEO" as const,
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

export const POSE_CONNECTIONS: [number, number][] = [
  // Face
  [0, 1], [1, 3], [3, 7],
  [0, 2], [2, 4], [4, 8],
  [9, 10],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left leg
  [23, 25], [25, 27], [27, 29], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [30, 32],
];

export const POSTURE_THRESHOLDS = {
  headForward: { good: 15, warning: 25 },
  shoulderSymmetry: { good: 85, warning: 70 },
  forwardLean: { good: 5, warning: 10 },
  spineAngle: { good: 20, warning: 35 },
};

export const SCORE_WEIGHTS = {
  headForward: 0.3,
  shoulderSymmetry: 0.2,
  forwardLean: 0.2,
  spineAngle: 0.3,
};
