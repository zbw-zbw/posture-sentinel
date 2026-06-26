import TechPrivacySection from "@/components/TechPrivacySection";

export const metadata = {
  title: "关于 - 体态哨兵",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-[1100px] mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">关于体态哨兵</h1>
        <p className="text-text-secondary mb-12 max-w-2xl">
          体态哨兵是一款基于 Web 摄像头的 AI 实时坐姿检测工具，帮助你养成良好的坐姿习惯，保护脊椎健康。
        </p>
        <TechPrivacySection />
      </div>
    </div>
  );
}
