/**
 * Model preloader — downloads and caches the MediaPipe pose model using a 3-tier strategy:
 *
 * Tier 1: Local file (public/models/pose_landmarker_lite.task) — fastest, ships with the app
 * Tier 2: IndexedDB cache — persists across sessions after first CDN download
 * Tier 3: Remote CDN — fallback for first visit or cache miss
 *
 * Usage:
 *   import { preloadModel, getCachedModelUrl } from "@/lib/model-loader";
 *   // Preload on homepage (non-blocking)
 *   preloadModel().then(url => console.log("ready:", url));
 *   // Get cached URL for PoseLandmarker
 *   const url = await getCachedModelUrl();
 */

const MODEL_CACHE_KEY = "posture-sentinel:model-cache";
const MODEL_CACHE_VERSION = 1;
const REMOTE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const LOCAL_MODEL_URL = "/models/pose_landmarker_lite.task";

// ── IndexedDB helpers ──

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("posture-sentinel-models", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("models")) {
        db.createObjectStore("models");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveModelToIDB(blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("models", "readwrite");
    tx.objectStore("models").put({ key: MODEL_CACHE_KEY, version: MODEL_CACHE_VERSION, blob, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getModelFromIDB(): Promise<{ blob: Blob; timestamp: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("models", "readonly");
      const request = tx.objectStore("models").get(MODEL_CACHE_KEY);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && entry.version === MODEL_CACHE_VERSION && entry.blob) {
          resolve({ blob: entry.blob, timestamp: entry.timestamp });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ── Public API ──

/**
 * Check if a cached model exists (IDB or local fetch probe).
 * Returns the URL to use, or null if not yet available.
 */
export async function getCachedModelUrl(): Promise<string | null> {
  // Tier 2: Check IndexedDB
  const cached = await getModelFromIDB();
  if (cached) {
    const objectUrl = URL.createObjectURL(cached.blob);
    return objectUrl;
  }

  // Tier 1: Check if local file exists by doing a HEAD request
  try {
    const resp = await fetch(LOCAL_MODEL_URL, { method: "HEAD" });
    if (resp.ok) {
      return LOCAL_MODEL_URL;
    }
  } catch {
    // local file not available (e.g., during dev)
  }

  return null;
}

/**
 * Preload the model in the background.
 * Returns the URL that can be used for PoseLandmarker.
 *
 * Strategy:
 * 1. Try local file first (fastest)
 * 2. If not available, download from CDN and cache to IndexedDB
 * 3. On subsequent loads, serve from IndexedDB (blob URL = instant)
 */
export async function preloadModel(): Promise<string> {
  // Tier 1: Try local file
  try {
    const resp = await fetch(LOCAL_MODEL_URL, { method: "HEAD" });
    if (resp.ok) {
      return LOCAL_MODEL_URL;
    }
  } catch {
    // local file not found
  }

  // Tier 2: Check IndexedDB cache
  const cached = await getModelFromIDB();
  if (cached) {
    // Cache is valid for 7 days
    const age = Date.now() - cached.timestamp;
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return URL.createObjectURL(cached.blob);
    }
    // Expired — re-download
  }

  // Tier 3: Download from CDN and cache
  const resp = await fetch(REMOTE_MODEL_URL);
  if (!resp.ok) {
    throw new Error(`Failed to download model: ${resp.status}`);
  }

  const blob = await resp.blob();

  // Cache to IndexedDB
  await saveModelToIDB(blob).catch(() => {
    // IndexedDB save failed (quota, privacy mode, etc.) — non-fatal
    console.warn("Failed to cache model to IndexedDB");
  });

  return URL.createObjectURL(blob);
}

/**
 * Preload model progress tracking.
 * Downloads the model and reports progress via callback.
 */
export async function preloadModelWithProgress(
  onProgress: (percent: number) => void
): Promise<string> {
  // Tier 1: Try local file
  try {
    const resp = await fetch(LOCAL_MODEL_URL, { method: "HEAD" });
    if (resp.ok) {
      onProgress(100);
      return LOCAL_MODEL_URL;
    }
  } catch {
    // local file not found
  }

  // Tier 2: Check IndexedDB cache
  const cached = await getModelFromIDB();
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < 7 * 24 * 60 * 60 * 1000) {
      onProgress(100);
      return URL.createObjectURL(cached.blob);
    }
  }

  // Tier 3: Download from CDN with progress
  const resp = await fetch(REMOTE_MODEL_URL);
  if (!resp.ok) {
    throw new Error(`Failed to download model: ${resp.status}`);
  }

  const contentLength = resp.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!resp.body || !total) {
    // No streaming support — just blob it
    onProgress(50);
    const blob = await resp.blob();
    onProgress(100);
    await saveModelToIDB(blob).catch(() => {});
    return URL.createObjectURL(blob);
  }

  // Read with progress
  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(Math.round((received / total) * 100), 100));
  }

  const blob = new Blob(chunks as BlobPart[]);
  await saveModelToIDB(blob).catch(() => {});
  return URL.createObjectURL(blob);
}
