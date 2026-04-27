import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Castfolio — 방송인 PR 페이지 빌더",
  description: "방송인 PR 페이지를 10분 만에 제작, 납품, 정산하는 수직형 SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased" style={{ background: "var(--bg-base)" }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
