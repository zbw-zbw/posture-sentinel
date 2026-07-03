"use client";

import { useEffect, useRef } from "react";

/**
 * Re-enables fade-in animation when sections scroll into view.
 * Uses IntersectionObserver to add the `is-visible` class to elements
 * with the `fade-in` class when they enter the viewport.
 *
 * Also uses MutationObserver to catch dynamically inserted .fade-in
 * elements (e.g. report page sections that mount after async data load).
 */
export default function ScrollObserver() {
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fallback for very old browsers
    if (!("IntersectionObserver" in window)) {
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
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      }
    );
    ioRef.current = observer;

    // Observe all existing fade-in elements
    function observeAll() {
      document.querySelectorAll(".fade-in:not(.is-visible)").forEach((el) => {
        observer.observe(el);
      });
    }
    observeAll();

    // Watch for dynamically added .fade-in elements (e.g. report page
    // sections that mount after async data fetch / Suspense resolve)
    const mo = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof Element) {
            if (node.classList?.contains("fade-in") || node.querySelector?.(".fade-in")) {
              hasNew = true;
              break;
            }
          }
        }
        if (hasNew) break;
      }
      if (hasNew) observeAll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
