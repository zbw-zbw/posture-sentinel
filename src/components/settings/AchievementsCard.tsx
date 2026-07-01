"use client";

import { useMemo } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

interface AchievementsCardProps {
  unlocked: UnlockedAchievement[];
}

/** Format a timestamp as "YYYY-MM-DD HH:MM" using local time. */
function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function AchievementsCard({
  unlocked,
}: AchievementsCardProps) {
  const total = ACHIEVEMENTS.length;

  // Map id -> unlockedAt for O(1) lookup.
  const unlockedMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of unlocked) {
      map.set(u.id, u.unlockedAt);
    }
    return map;
  }, [unlocked]);

  return (
    <div className="bg-surface rounded-2xl p-6 card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          成就徽章
        </h3>
        <span className="text-sm text-text-secondary">
          已解锁{" "}
          <span className="text-text-primary font-bold">{unlocked.length}</span>{" "}
          / {total}
        </span>
      </div>

      {/* Badge grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlockedAt = unlockedMap.get(ach.id);
          const isUnlocked = unlockedAt !== undefined;
          const tooltip = isUnlocked
            ? `${ach.name} - 解锁于 ${formatDateTime(unlockedAt)}`
            : undefined;

          return (
            <div
              key={ach.id}
              title={tooltip}
              className={`relative rounded-xl p-4 text-center transition-all ${
                isUnlocked
                  ? "bg-primary-light"
                  : "bg-surface-alt opacity-50 grayscale cursor-default"
              } ${isUnlocked ? "cursor-pointer" : ""}`}
            >
              {/* Icon */}
              <div className="relative inline-block mb-2">
                <span className="text-3xl leading-none block">
                  {ach.icon}
                </span>
                {/* Lock overlay for locked badges */}
                {!isUnlocked && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-surface/80">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  </span>
                )}
              </div>

              {/* Name */}
              <p
                className={`text-sm font-medium mb-1 ${
                  isUnlocked ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {ach.name}
              </p>

              {/* Description */}
              <p className="text-xs text-text-muted leading-snug">
                {ach.description}
              </p>

              {/* Unlocked indicator */}
              {isUnlocked && (
                <div className="absolute top-1.5 right-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
