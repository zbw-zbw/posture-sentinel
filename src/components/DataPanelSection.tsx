"use client";

import type { RefObject } from "react";
import { useCountUp } from "@/hooks/useCountUp";

export default function DataPanelSection() {
  const metrics = [
    { value: 3, unit: "秒", label: "AI 响应速度" },
    { value: 33, unit: "个", label: "骨骼关键点" },
    { value: 0, unit: "元", label: "使用成本" },
    { value: 100, unit: "%", label: "本地处理" },
  ];

  return (
    <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-24">
      <div className="bg-dark rounded-2xl p-8 md:p-12 fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((metric, index) => (
            <AnimatedMetric key={index} value={metric.value} unit={metric.unit} label={metric.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedMetric({ value, unit, label }: { value: number; unit: string; label: string }) {
  const { value: displayValue, elementRef } = useCountUp({
    target: value,
    duration: 1000,
    triggerOnVisible: true,
  });

  return (
    <div ref={elementRef as RefObject<HTMLDivElement>}>
      <p className="text-3xl md:text-4xl font-bold text-white">
        {displayValue}{unit}
      </p>
      <p className="text-sm text-white/70 mt-1">
        {label}
      </p>
    </div>
  );
}
