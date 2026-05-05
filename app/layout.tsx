import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnKata AI Tutor",
  description: "本地优先的中文 AI 学习助手"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
