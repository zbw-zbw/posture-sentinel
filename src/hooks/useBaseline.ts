"use client";

import { useState, useCallback, useEffect } from "react";
import { getBaseline, saveBaseline, clearBaseline, type PostureBaseline } from "@/lib/storage";

export function useBaseline() {
  const [baseline, setBaseline] = useState<PostureBaseline | null>(null);

  useEffect(() => {
    setBaseline(getBaseline());
  }, []);

  const captureBaseline = useCallback((data: Omit<PostureBaseline, "capturedAt">) => {
    const entry: PostureBaseline = { ...data, capturedAt: Date.now() };
    saveBaseline(entry);
    setBaseline(entry);
    return entry;
  }, []);

  const removeBaseline = useCallback(() => {
    clearBaseline();
    setBaseline(null);
  }, []);

  return {
    baseline,
    hasBaseline: baseline !== null,
    captureBaseline,
    removeBaseline,
  };
}
