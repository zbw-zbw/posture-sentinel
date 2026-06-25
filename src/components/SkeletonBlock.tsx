"use client";

interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: string;
}

export default function SkeletonBlock({ width = "100%", height = 16, className = "", rounded = "rounded-md" }: SkeletonBlockProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;
  return (
    <div
      className={`bg-surface-alt animate-pulse ${rounded} ${className}`}
      style={{ width: w, height: h }}
    />
  );
}
