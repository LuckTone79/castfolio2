"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PageStat {
  id: string;
  slug: string;
  talentName: string;
  totalViews: number;
  recentViews: number;
  publishedAt: string | null;
}

interface DailyView {
  day: string;
  count: number;
}

interface Referrer {
  referrer: string;
  count: number;
}

interface AnalyticsData {
  pages: PageStat[];
  dailyViews: DailyView[];
  topReferrers: Referrer[];
  totals: { views: number; uniqueVisitors: number; pages: number };
  period: { days: number; since: string };
}

const PERIOD_OPTIONS = [
  { label: "7일", value: 7 },
  { label: "30일", value: 30 },
  { label: "90일", value: 90 },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const maxDaily = data?.dailyViews ? Math.max(...data.dailyViews.map((d) => d.count), 1) : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>페이지뷰 분석</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>배포된 PR 페이지 방문 현황</p>
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--bg-elevated)" }}>
          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setDays(o.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: days === o.value ? "var(--bg-surface)" : "transparent",
                color: days === o.value ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: days === o.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.pages.length === 0 ? (
        <div className="rounded-3xl border p-12 text-center" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <p className="text-2xl mb-2">📊</p>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>배포된 PR 페이지가 없습니다</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>PR 페이지를 배포하면 방문 통계가 표시됩니다.</p>
          <Link href="/dashboard/projects" className="inline-block mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#7C5CFC" }}>
            프로젝트 보기 →
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: `${days}일 방문`, value: data.totals.views.toLocaleString(), icon: "👁" },
              { label: `${days}일 순방문자`, value: data.totals.uniqueVisitors.toLocaleString(), icon: "👤" },
              { label: "배포된 페이지", value: data.totals.pages.toLocaleString(), icon: "🌐" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border p-5" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
                <p className="text-2xl mb-1">{kpi.icon}</p>
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Daily Chart */}
          <div className="rounded-2xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>일별 방문 추이</h2>
            {data.dailyViews.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>기간 내 방문 기록이 없습니다.</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {data.dailyViews.map((d) => (
                  <div
                    key={d.day}
                    title={`${d.day}: ${d.count}회`}
                    className="flex-1 rounded-t-sm transition-all cursor-default"
                    style={{
                      height: `${Math.max((d.count / maxDaily) * 100, 4)}%`,
                      background: "linear-gradient(180deg, #7C5CFC 0%, #5A3FD8 100%)",
                      opacity: 0.85,
                      minWidth: 2,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {data.dailyViews[0]?.day}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {data.dailyViews[data.dailyViews.length - 1]?.day}
              </span>
            </div>
          </div>

          {/* Pages Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>페이지별 방문 현황</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border-subtle)` }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>방송인</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold hidden md:table-cell" style={{ color: "var(--text-muted)" }}>URL</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{days}일 방문</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>누적 방문</th>
                </tr>
              </thead>
              <tbody>
                {data.pages
                  .sort((a, b) => b.recentViews - a.recentViews)
                  .map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid var(--border-subtle)` }}>
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{p.talentName}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <a
                        href={`/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: "#7C5CFC" }}
                      >
                        /p/{p.slug}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.recentViews.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: "var(--text-muted)" }}>
                      {p.totalViews.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Referrers */}
          {data.topReferrers.length > 0 && (
            <div className="rounded-2xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>유입 경로 TOP 10</h2>
              <div className="space-y-2">
                {data.topReferrers.map((r, i) => {
                  const pct = Math.round((r.count / (data.topReferrers[0]?.count || 1)) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                            {r.referrer.length > 60 ? r.referrer.slice(0, 60) + "…" : r.referrer}
                          </span>
                          <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>{r.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "#7C5CFC" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
