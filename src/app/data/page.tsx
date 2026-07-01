"use client";
import { useBaseline } from "@/hooks/useBaseline";
import BaselineCard from "@/components/settings/BaselineCard";
import DataManagementCard from "@/components/settings/DataManagementCard";
import { exportAllData, importAllData } from "@/lib/storage";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DataPage() {
  const { baseline, removeBaseline } = useBaseline();
  const router = useRouter();

  const handleExport = useCallback(() => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posture-sentinel-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((file: File, mode: "overwrite" | "merge") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version || !data.sessions) {
          alert("文件格式不正确");
          return;
        }
        importAllData(data, mode);
        window.location.reload();
      } catch {
        alert("文件解析失败");
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen pb-10">
      <section className="bg-gradient-to-b from-primary-light/10 to-transparent px-4 md:px-6 pt-20 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-alt transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">数据管理</h1>
              <p className="text-sm md:text-base text-text-secondary">管理个人校准数据、导入导出备份</p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-3xl mx-auto">
          <BaselineCard baseline={baseline} onRecalibrate={() => router.push("/detect")} onClear={removeBaseline} />
        </div>
      </section>
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-3xl mx-auto">
          <DataManagementCard onExport={handleExport} onImport={handleImport} />
        </div>
      </section>
    </div>
  );
}
