"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { playAlertSound } from "@/lib/sound";

interface UseAlertSystemReturn {
  isAlertVisible: boolean;
  alertMessage: string;
  alertType: "warning" | "bad";
  showAlert: (message: string, type: "warning" | "bad") => void;
  dismissAlert: () => void;
}

export function useAlertSystem(alertMethod: "visual" | "sound" | "both", alertVolume: number): UseAlertSystemReturn {
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"warning" | "bad">("warning");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alertCountRef = useRef<number>(0);

  const dismissAlert = useCallback(() => {
    setIsAlertVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showAlert = useCallback((message: string, type: "warning" | "bad") => {
    // Dismiss previous if any
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setAlertMessage(message);
    setAlertType(type);
    setIsAlertVisible(true);
    alertCountRef.current += 1;

    // Play sound if configured
    if (alertMethod === "sound" || alertMethod === "both") {
      playAlertSound(type, alertVolume);
    }

    // Auto-dismiss after 8 seconds
    timerRef.current = setTimeout(() => {
      setIsAlertVisible(false);
      timerRef.current = null;
    }, 8000);
  }, [alertMethod, alertVolume]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isAlertVisible, alertMessage, alertType, showAlert, dismissAlert };
}
