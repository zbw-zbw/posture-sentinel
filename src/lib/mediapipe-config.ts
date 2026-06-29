export const MEDIAPIPE_CONFIG = {
  modelAssetPath:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  modelAssetPathCdn:
    "https://cdn.jsdelivr.net/gh/nicehash/nicehash-calculator@main/public/models/pose_landmarker_lite/pose_landmarker_lite.task",
  wasmPath:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
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
