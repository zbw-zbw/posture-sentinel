"use client";

import { useBaseline } from "@/hooks/useBaseline";
import BaselineCard from "@/components/settings/BaselineCard";
import DataManagementCard from "@/components/settings/DataManagementCard";
import { exportAllData, importAllData, getSessions } from "@/lib/storage";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DataPage() {
  const { baseline, removeBaseline } = useBaseline();
  const router = useRouter();
  const [stats, setStats] = useState<{ sessions: number; totalMinutes: number } | null>(null);

  useEffect(() => {
    const sessions = getSessions();
    const totalSec = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    setStats({ sessions: sessions.length, totalMinutes: Math.round(totalSec / 60) });
  }, []);

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

  const handleImport = useCallback(async (file: File, mode: "overwrite" | "merge"): Promise<boolean> => {
    try {
      // Async file read via File.text() — avoids blocking the main thread
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !Array.isArray(data.sessions)) return false;

      importAllData(data, mode);

      // Refresh stats after import
      const sessions = getSessions();
      const totalSec = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      setStats({ sessions: sessions.length, totalMinutes: Math.round(totalSec / 60) });

      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="min-h-screen pb-12">
      <section className="bg-gradient-to-b from-primary-light/10 to-transparent px-4 md:px-6 pt-20 pb-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-surface-alt transition-colors" aria-label="返回">
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

      {/* Data Overview */}
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-2xl p-5 text-center border border-border">
              <p className="text-2xl font-bold text-primary-text tabular-nums">{stats?.sessions ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">检测记录</p>
            </div>
            <div className="bg-surface rounded-2xl p-5 text-center border border-border">
              <p className="text-2xl font-bold text-primary-text tabular-nums">{stats?.totalMinutes ?? "—"}</p>
              <p className="text-sm text-text-muted mt-1">累计分钟</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-[1100px] mx-auto">
          <BaselineCard baseline={baseline} onRecalibrate={() => router.push("/detect")} onClear={removeBaseline} />
        </div>
      </section>
      <section className="px-4 md:px-6 mt-6">
        <div className="max-w-[1100px] mx-auto">
          <DataManagementCard onExport={handleExport} onImport={handleImport} />
        </div>
      </section>
    </div>
  );
}
