"use client";
import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number; // ms, default 1500
  decimals?: number; // default 0
  animate?: boolean; // default true; false = show target immediately
  triggerOnVisible?: boolean; // default false; uses IntersectionObserver
}

export function useCountUp({
  target,
  duration = 1500,
  decimals = 0,
  animate = true,
  triggerOnVisible = false,
}: UseCountUpOptions) {
  const [value, setValue] = useState(triggerOnVisible ? 0 : (animate ? 0 : target));
  const startedRef = useRef(!triggerOnVisible);
  const elementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!animate || prefersReducedMotion) {
      setValue(target);
      return;
    }

    if (triggerOnVisible) {
      const el = elementRef.current;
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          runAnimation();
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(el);
      // IMPORTANT: also cancel rAF on cleanup, not just IO
      return () => {
        io.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    runAnimation();

    function runAnimation() {
      const start = performance.now();
      const from = 0;
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const v = from + (target - from) * ease;
        setValue(decimals > 0 ? Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(v));
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals, animate, triggerOnVisible]);

  return { value, elementRef };
}

