"use client";

import { useEffect, useRef } from "react";

/**
 * Re-enables fade-in animation when sections scroll into view.
 * Uses IntersectionObserver to add the `is-visible` class to elements
 * with the `fade-in` class when they enter the viewport.
 */
export default function ScrollObserver() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Check if IntersectionObserver is available
    if (!("IntersectionObserver" in window)) {
      // Fallback: just make all fade-in elements visible immediately
      document.querySelectorAll(".fade-in").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Unobserve once visible to avoid re-triggering
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll(".fade-in:not(.is-visible)");
    fadeElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
