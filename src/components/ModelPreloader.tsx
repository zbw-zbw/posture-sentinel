"use client";

import { useEffect, useRef } from "react";

/**
 * Invisible component that preloads the pose model when mounted.
 * Place it on the homepage so the model starts loading immediately,
 * making it instantly available when the user navigates to /detect.
 */
export default function ModelPreloader() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Non-blocking preload — don't await, just fire in background
    import("@/lib/model-loader").then(({ preloadModel }) => {
      preloadModel().then((url) => {
        console.log("[ModelPreloader] Model ready:", url);
      }).catch(() => {
        // Silently fail — the detect page will retry
      });
    });
  }, []);

  return null;
}
