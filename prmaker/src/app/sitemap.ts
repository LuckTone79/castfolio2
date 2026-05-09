import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${appUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${appUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // Published PR pages
  let published: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.page.findMany({
      where: { status: "PUBLISHED", noindex: false },
      select: { slug: true, publishedAt: true, updatedAt: true },
    });
    published = pages.map((p) => ({
      url: `${appUrl}/p/${p.slug}`,
      lastModified: p.publishedAt || p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB may not be accessible during build — skip dynamic entries
  }

  return [...statics, ...published];
}
