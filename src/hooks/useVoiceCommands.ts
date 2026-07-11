"use client";

import { useEffect, useRef, useState } from "react";

// Web Speech API types (not yet in lib.dom.d.ts)
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceCommandsOptions {
  enabled: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

interface VoiceCommandState {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  confidence: number;
}

const COMMANDS: Record<string, string[]> = {
  start: ["开始", "开始检测", "检测", "启动", "start", "go"],
  pause: ["暂停", "等一下", "停", "pause"],
  resume: ["继续", "恢复", "接着", "resume", "continue"],
  stop: ["结束", "停止", "退出", "关闭", "end", "finish"],
};

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Remove common punctuation and whitespace so "开始。" / "开始检测！" still match
    .replace(/[\p{P}\s]/gu, "");
}

function matchCommand(transcript: string): string | null {
  const text = normalizeText(transcript);
  if (!text) return null;
  for (const [cmd, keywords] of Object.entries(COMMANDS)) {
    for (const kw of keywords) {
      if (text.includes(normalizeText(kw))) return cmd;
    }
  }
  return null;
}

export function useVoiceCommands({
  enabled,
  onStart,
  onPause,
  onResume,
  onStop,
}: UseVoiceCommandsOptions) {
  const [state, setState] = useState<VoiceCommandState>({
    isListening: false,
    isSupported: false,
    lastCommand: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const handlersRef = useRef({ onStart, onPause, onResume, onStop });
  handlersRef.current = { onStart, onPause, onResume, onStop };

  // Check browser support once
  useEffect(() => {
    const supported = typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setState(s => ({ ...s, isSupported: supported }));
  }, []);

  // Manage recognition lifecycle
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      // Always reflect that listening is off when disabled, even if the
      // recognition instance was already nulled by the cleanup path.
      setState(s => ({ ...s, isListening: false }));
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "zh-CN";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          const cmd = matchCommand(transcript);

          setState(s => ({ ...s, lastCommand: cmd ? transcript : null, confidence }));

          if (cmd) {
            const h = handlersRef.current;
            switch (cmd) {
              case "start": h.onStart?.(); break;
              case "pause": h.onPause?.(); break;
              case "resume": h.onResume?.(); break;
              case "stop": h.onStop?.(); break;
            }
          }
        }
      }
    };

    recognition.onstart = () => setState(s => ({ ...s, isListening: true }));
    recognition.onend = () => {
      if (!recognitionRef.current) return;  // Component unmounted, don't setState
      // Auto-restart if still enabled
      setState(s => ({ ...s, isListening: false }));
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.onerror = (event: { error: string }) => {
      // no-speech and aborted are normal, ignore
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("[VoiceCommands]", event.error);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}

    return () => {
      recognitionRef.current = null;    // Set null first to prevent onend restart
      try { recognition.abort(); } catch {}
    };
  }, [enabled]);

  return state;
}
