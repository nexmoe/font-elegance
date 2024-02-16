import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "高级文本格式化工具：轻松优化您的中英文排版",
  description: "本工具提供一站式解决方案，帮助您高效地处理和格式化中英文文本。通过全面的格式化选项，您可以快速转换全角标点、自动添加中英文之间的空格、启用 Markdown 转 Emoji 等。本工具旨在提升您的文本处理效率，优化阅读体验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
