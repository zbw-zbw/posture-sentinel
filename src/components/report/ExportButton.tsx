"use client";

import { useState, useCallback, useRef } from "react";

interface ExportButtonProps {
  targetId: string; // id of the DOM element to capture
}

export default function ExportButton({ targetId }: ExportButtonProps) {
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
      disabled={exporting}
      className="flex items-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
