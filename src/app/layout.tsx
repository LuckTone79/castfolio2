import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Castfolio",
  description: "방송인 PR 페이지 빌더",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
