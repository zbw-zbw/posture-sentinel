import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "设置 - 体态哨兵",
  description: "自定义检测灵敏度、提醒方式和姿态阈值参数。",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
