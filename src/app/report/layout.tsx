import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "健康日报 - 体态哨兵",
  description: "查看每日坐姿检测数据、评分趋势和 AI 个性化改善建议。",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
