import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

  return {
    rules: [
      {
        // Allow public PR pages; block all dashboard/admin/api paths
        userAgent: "*",
        allow: ["/p/", "/terms", "/privacy"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/preview/", "/submit/", "/review/", "/quote/", "/delivered/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
