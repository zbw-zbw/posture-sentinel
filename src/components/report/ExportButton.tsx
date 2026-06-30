"use client";

import { useState, useCallback, useRef } from "react";

interface ExportButtonProps {
  targetId: string;
  disabled?: boolean;
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

      // Force all lab() colors to be resolved before html2canvas parses them
      // by temporarily forcing a style recalculation
      const computed = getComputedStyle(document.documentElement);

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        // Ignore CSS variables — use computed colors instead
        onclone: (clonedDoc) => {
          const root = clonedDoc.documentElement;
          // Copy computed background to avoid lab() parsing issues
          root.style.background = "#f8fafb";
          // Remove any gradient backgrounds that use lab()
          const allElements = root.querySelectorAll("*");
          allElements.forEach((el) => {
            const elAny = el as HTMLElement;
            const bg = elAny.style.background;
            if (bg && bg.includes("lab")) {
              elAny.style.background = "#ffffff";
            }
            const gradient = elAny.style.backgroundImage;
            if (gradient && gradient.includes("lab")) {
              elAny.style.backgroundImage = "none";
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
