"use client";
import { useEffect } from "react";
import { cleanupOldSessions } from "@/lib/storage";

export default function StorageCleanup() {
  useEffect(() => {
    cleanupOldSessions();
  }, []);
  return null;
}
