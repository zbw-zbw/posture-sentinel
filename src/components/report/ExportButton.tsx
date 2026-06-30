"use client";

import { useState, useCallback, useRef } from "react";

interface ExportButtonProps {
  targetId: string;
  disabled?: boolean;
}

/**
 * Strip modern CSS color functions (lab, oklch, oklab, color-mix, lch)
 * from stylesheet text that html2canvas cannot parse.
 */
function sanitizeStylesheet(css: string): string {
  return css
    .replace(/oklch\([^)]*\)/gi, "#888888")
    .replace(/oklab\([^)]*\)/gi, "#888888")
    .replace(/\blab\([^)]*\)/gi, "#888888")
    .replace(/\blch\([^)]*\)/gi, "#888888")
    .replace(/color-mix\(.*?\)/gi, "#888888")
    .replace(/hwb\([^)]*\)/gi, "#888888");
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
          // Fix body background (remove lab/oklch gradients)
          clonedDoc.body.style.background = "#f8fafb";
          clonedDoc.body.style.backgroundImage = "none";
          clonedDoc.documentElement.style.background = "#f8fafb";
          clonedDoc.documentElement.style.backgroundImage = "none";

          // Sanitize all <style> tags in the cloned document
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((tag) => {
            if (tag.textContent) {
              tag.textContent = sanitizeStylesheet(tag.textContent);
            }
          });

          // Also sanitize inline styles on every element
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              for (let i = 0; i < htmlEl.style.length; i++) {
                const prop = htmlEl.style[i];
                const val = htmlEl.style.getPropertyValue(prop);
                if (val && /oklch|oklab|\blab\(|lch\(|color-mix|hwb/.test(val)) {
                  htmlEl.style.removeProperty(prop);
                }
              }
            }
          });
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
      alert("导出失败，请重试");
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
