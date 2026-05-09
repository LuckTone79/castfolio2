import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get("days") || "30"), 90);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get all published pages for this user
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", project: { userId: user.id } },
    select: {
      id: true,
      slug: true,
      viewsCount: true,
      publishedAt: true,
      project: { select: { talent: { select: { nameKo: true } } } },
    },
  });

  if (pages.length === 0) {
    return NextResponse.json({ pages: [], dailyViews: [], totals: { views: 0, uniqueVisitors: 0, pages: 0 } });
  }

  const pageIds = pages.map((p) => p.id);

  // Daily view counts (last N days, grouped by date)
  const rawViews = await prisma.pageView.groupBy({
    by: ["pageId"],
    where: { pageId: { in: pageIds }, viewedAt: { gte: since } },
    _count: { id: true },
  });

  const viewsByPage = Object.fromEntries(rawViews.map((v) => [v.pageId, v._count.id]));

  // Daily aggregation
  const dailyRaw = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
    SELECT DATE("viewedAt") as day, COUNT(*)::int as count
    FROM "castfolio"."PageView"
    WHERE "pageId" = ANY(${pageIds})
      AND "viewedAt" >= ${since}
    GROUP BY DATE("viewedAt")
    ORDER BY day ASC
  `;

  const dailyViews = dailyRaw.map((r) => ({
    day: r.day,
    count: Number(r.count),
  }));

  // Top referrers
  const referrers = await prisma.pageView.groupBy({
    by: ["referrer"],
    where: { pageId: { in: pageIds }, viewedAt: { gte: since }, referrer: { not: "" } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const totalViews = rawViews.reduce((s, v) => s + v._count.id, 0);
  const uniqueVisitors = await prisma.pageView.groupBy({
    by: ["ipHash"],
    where: { pageId: { in: pageIds }, viewedAt: { gte: since } },
  }).then((r) => r.length);

  const pagesWithViews = pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    talentName: p.project.talent.nameKo,
    totalViews: p.viewsCount,
    recentViews: viewsByPage[p.id] || 0,
    publishedAt: p.publishedAt,
  }));

  return NextResponse.json({
    pages: pagesWithViews,
    dailyViews,
    topReferrers: referrers.map((r) => ({ referrer: r.referrer || "(직접 방문)", count: r._count.id })),
    totals: {
      views: totalViews,
      uniqueVisitors,
      pages: pages.length,
    },
    period: { days, since },
  });
}
