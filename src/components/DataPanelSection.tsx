"use client";

export default function DataPanelSection() {
  const metrics = [
    { value: "3秒", label: "AI 响应速度" },
    { value: "33个", label: "骨骼关键点" },
    { value: "0元", label: "使用成本" },
    { value: "100%", label: "本地处理" },
  ];

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-24">
      <div className="bg-dark rounded-2xl p-8 md:p-12 fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((metric, index) => (
            <div key={index}>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {metric.value}
              </p>
              <p className="text-sm text-text-muted mt-1">
                / {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}