"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DataManagementCardProps {
  onExport: () => void;
  onImport: (file: File, mode: "overwrite" | "merge") => void;
}

type ImportMode = "overwrite" | "merge";

export default function DataManagementCard({
  onExport,
  onImport,
}: DataManagementCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pending file awaiting user's import-mode choice.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("overwrite");

  // Success toast (shown after export / import completes).
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // ── Toast helpers ──
  const showToast = useCallback((message: string) => {
    setToast(message);
    // Trigger entrance on next frame so the transition runs.
    requestAnimationFrame(() => setToastVisible(true));
  }, []);

  // Auto-hide toast after 2.5s.
  useEffect(() => {
    if (!toast) return;
    const hideTimer = window.setTimeout(() => setToastVisible(false), 2500);
    // Fully unmount after the exit transition (300ms).
    const unmountTimer = window.setTimeout(() => setToast(null), 2800);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [toast]);

  // ── Export ──
  const handleExport = () => {
    onExport();
    showToast("数据已导出");
  };

  // ── Import flow ──
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so selecting the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    // Basic validation: accept .json files or generic JSON content type.
    const isJson =
      file.name.toLowerCase().endsWith(".json") ||
      file.type === "application/json";
    if (!isJson) {
      showToast("请选择 JSON 格式的文件");
      return;
    }

    setImportMode("overwrite");
    setPendingFile(file);
  };

  const handleConfirmImport = () => {
    if (!pendingFile) return;
    onImport(pendingFile, importMode);
    setPendingFile(null);
    showToast(importMode === "overwrite" ? "数据已覆盖导入" : "数据已合并导入");
  };

  const handleCancelImport = () => {
    setPendingFile(null);
  };

  return (
    <>
      <div className="bg-surface rounded-2xl p-6 card-hover">
        {/* Header */}
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          数据管理
        </h3>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-3 rounded-xl transition-all text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出数据
          </button>

          {/* Import */}
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 bg-surface-alt hover:bg-border text-text-secondary font-medium px-4 py-3 rounded-xl transition-all text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导入数据
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Hint text */}
        <p className="text-xs text-text-muted">
          导出文件包含所有检测记录、设置和成就
        </p>
      </div>

      {/* Import mode dialog */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h4 className="text-lg font-bold text-text-primary mb-1">
              导入数据
            </h4>
            <p className="text-sm text-text-secondary mb-1">
              已选择文件:{" "}
              <span className="text-text-primary font-medium break-all">
                {pendingFile.name}
              </span>
            </p>
            <p className="text-xs text-text-muted mb-4">
              文件大小: {(pendingFile.size / 1024).toFixed(1)} KB
            </p>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-warning-light rounded-xl p-3 mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs text-text-secondary leading-relaxed">
                导入操作将修改本地数据。选择&ldquo;覆盖&rdquo;会替换所有现有数据，
                选择&ldquo;合并&rdquo;会按记录 ID 去重后追加。此操作无法撤销。
              </p>
            </div>

            {/* Mode options */}
            <div className="space-y-2 mb-5">
              <button
                onClick={() => setImportMode("overwrite")}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  importMode === "overwrite"
                    ? "border-primary bg-primary-light"
                    : "border-border bg-surface-alt hover:bg-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      importMode === "overwrite"
                        ? "border-primary"
                        : "border-text-muted"
                    }`}
                  >
                    {importMode === "overwrite" && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    覆盖现有数据
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1 ml-6">
                  清除并替换全部本地数据
                </p>
              </button>

              <button
                onClick={() => setImportMode("merge")}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  importMode === "merge"
                    ? "border-primary bg-primary-light"
                    : "border-border bg-surface-alt hover:bg-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      importMode === "merge"
                        ? "border-primary"
                        : "border-text-muted"
                    }`}
                  >
                    {importMode === "merge" && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    合并去重
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1 ml-6">
                  保留现有数据，按 ID 去重后追加新记录
                </p>
              </button>
            </div>

            {/* Dialog actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelImport}
                className="flex-1 bg-surface-alt hover:bg-border text-text-secondary font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / info toast */}
      {toast && (
        <div className="fixed bottom-5 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
          <div
            className={`flex items-center gap-2 bg-dark-surface text-white px-5 py-3 rounded-xl shadow-xl transition-all duration-300 ${
              toastVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-primary-light"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
