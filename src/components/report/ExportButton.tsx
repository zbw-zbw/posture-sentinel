"use client";

import { useState, useCallback, useRef } from "react";

interface ExportButtonProps {
  targetId: string;
  disabled?: boolean;
}

/**
 * Force-set safe color values on the cloned DOM to bypass
 * html2canvas's inability to parse Tailwind v4's oklch() compiled output.
 * Strategy: remove all <style>/<link>, then walk elements and inline
 * computed styles. For color properties that contain oklch/lab/etc.,
 * use a hex color map based on known Tailwind class patterns.
 */
function prepareCloneForCapture(clonedDoc: Document, targetId: string) {
  // Remove all external CSS — this prevents html2canvas from parsing
  // compiled Tailwind stylesheets that contain oklch/color() functions
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => el.remove());

  // Map of Tailwind CSS variable names → safe hex fallbacks
  // These match our @theme definitions in globals.css
  const colorMap: Record<string, string> = {
    "#10b981": "#10b981", // primary
    "#059669": "#059669", // primary-dark
    "#34d399": "#34d399", // primary-light
    "#f8fafb": "#f8fafb", // bg
    "#f0f4f8": "#f0f4f8",
    "#ffffff": "#ffffff", // surface
    "#f1f5f9": "#f1f5f9", // surface-alt
    "#e2e8f0": "#e2e8f0", // border
    "#f59e0b": "#f59e0b", // warning
    "#fbbf24": "#fbbf24", // warning-light
    "#ef4444": "#ef4444", // danger
    "#fecaca": "#fecaca", // danger-light
    "#0f172a": "#0f172a", // text-primary
    "#475569": "#475569", // text-secondary
    "#94a3b8": "#94a3b8", // text-muted
    "#1e293b": "#1e293b",
    "#64748b": "#64748b",
    "#99f6e4": "#99f6e4",
    "#d1fae5": "#d1fae5",
    "#a7f3d0": "#a7f3d0",
    "#fde68a": "#fde68a",
    "#fee2e2": "#fee2e2",
    "transparent": "transparent",
  };

  const hexRegex = /#[0-9a-fA-F]{3,8}/g;
  const oklchRegex = /oklch|oklab|\blab\(|lch\(|color-mix|hwb|color\(/;

  const targetEl = clonedDoc.getElementById(targetId);
  if (!targetEl) return;

  // Walk all descendant elements
  const elements = Array.from(targetEl.querySelectorAll("*"));
  elements.push(targetEl);

  for (const el of elements) {
    const htmlEl = el as HTMLElement;
    const originalStyle = htmlEl.getAttribute("style") || "";

    // Get computed style from the original document's window won't work here.
    // Instead, rely on the fact that Tailwind classes have already been applied
    // and the browser has computed styles. After removing <style> tags,
    // computed styles in the clone may revert, so we inline from original document.

    // For each element, check its class list and apply known color mappings
    const classList = htmlEl.className;
    if (typeof classList === "string") {
      // Text colors
      if (classList.includes("text-primary")) htmlEl.style.setProperty("color", "#10b981", "important");
      if (classList.includes("text-primary-dark")) htmlEl.style.setProperty("color", "#059669", "important");
      if (classList.includes("text-text-primary")) htmlEl.style.setProperty("color", "#0f172a", "important");
      if (classList.includes("text-text-secondary")) htmlEl.style.setProperty("color", "#475569", "important");
      if (classList.includes("text-text-muted")) htmlEl.style.setProperty("color", "#94a3b8", "important");
      if (classList.includes("text-warning")) htmlEl.style.setProperty("color", "#f59e0b", "important");
      if (classList.includes("text-danger")) htmlEl.style.setProperty("color", "#ef4444", "important");
      if (classList.includes("text-white")) htmlEl.style.setProperty("color", "#ffffff", "important");

      // Background colors
      if (classList.includes("bg-primary")) htmlEl.style.setProperty("background-color", "#10b981", "important");
      if (classList.includes("bg-primary-dark")) htmlEl.style.setProperty("background-color", "#059669", "important");
      if (classList.includes("bg-primary-light")) htmlEl.style.setProperty("background-color", "#d1fae5", "important");
      if (classList.includes("bg-bg")) htmlEl.style.setProperty("background-color", "#f8fafb", "important");
      if (classList.includes("bg-surface")) htmlEl.style.setProperty("background-color", "#ffffff", "important");
      if (classList.includes("bg-surface-alt")) htmlEl.style.setProperty("background-color", "#f1f5f9", "important");
      if (classList.includes("bg-warning")) htmlEl.style.setProperty("background-color", "#f59e0b", "important");
      if (classList.includes("bg-warning-light")) htmlEl.style.setProperty("background-color", "#fde68a", "important");
      if (classList.includes("bg-danger")) htmlEl.style.setProperty("background-color", "#ef4444", "important");
      if (classList.includes("bg-danger-light")) htmlEl.style.setProperty("background-color", "#fee2e2", "important");

      // Border colors
      if (classList.includes("border-primary")) htmlEl.style.setProperty("border-color", "#10b981", "important");
      if (classList.includes("border-border")) htmlEl.style.setProperty("border-color", "#e2e8f0", "important");
      if (classList.includes("border-danger")) htmlEl.style.setProperty("border-color", "#ef4444", "important");

      // Gradients - replace with solid fallback backgrounds
      if (classList.includes("from-primary-light") && classList.includes("to-transparent")) {
        htmlEl.style.setProperty("background", "linear-gradient(to bottom right, #d1fae5, transparent)", "important");
      }
      if (classList.includes("from-white") && classList.includes("to-primary-light")) {
        htmlEl.style.setProperty("background", "linear-gradient(to bottom right, #ffffff, #d1fae5)", "important");
      }
    }
  }
}

export default function ExportButton({ targetId, disabled }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById(targetId);
      if (!element) {
        alert("导出区域未找到");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Fix body background
          clonedDoc.body.style.background = "#f8fafb";
          clonedDoc.body.style.backgroundImage = "none";
          clonedDoc.documentElement.style.background = "#f8fafb";
          clonedDoc.documentElement.style.backgroundImage = "none";

          // Remove all stylesheets and inline safe color fallbacks
          prepareCloneForCapture(clonedDoc, targetId);

          void clonedDoc.body.offsetHeight;
        },
      });

      const link = document.createElement("a");
      link.download = `体态哨兵-日报-${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setDone(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error("Export failed:", err);
      alert(`导出失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setExporting(false);
    }
  }, [targetId]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting || disabled}
      title={disabled ? "暂无数据，无法导出" : "导出报告为图片"}
      className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? "导出中..." : done ? "已导出 ✓" : "导出为图片"}
    </button>
  );
}
