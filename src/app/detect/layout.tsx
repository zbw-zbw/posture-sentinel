import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "实时检测 - 体态哨兵",
  description: "打开摄像头，AI 实时检测你的坐姿状态，识别驼背、头前倾等不良姿势。",
};

export default function DetectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
