"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#f7f4ee] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-[32px] border border-black/10 p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill="#EF4444" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-sm text-slate-500 leading-7 mb-6">
              일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              {error.digest && (
                <span className="block mt-2 text-xs text-slate-400 font-mono">오류 코드: {error.digest}</span>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-slate-950 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                다시 시도
              </button>
              <a
                href="/dashboard"
                className="px-5 py-2.5 border border-black/10 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                대시보드로
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
