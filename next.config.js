const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@prisma/client", "pdf-lib"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      // Legacy partner workspace consolidated into a single /app workspace.
      { source: "/dashboard", destination: "/app", permanent: true },
      { source: "/dashboard/:path*", destination: "/app/:path*", permanent: true },
      // Shareable entry URL: https://www.wideget.net/castfolio -> https://castfolio.wideget.net
      {
        source: "/castfolio",
        has: [{ type: "host", value: "www.wideget.net" }],
        destination: "https://castfolio.wideget.net",
        permanent: true,
      },
      {
        source: "/castfolio/:path*",
        has: [{ type: "host", value: "www.wideget.net" }],
        destination: "https://castfolio.wideget.net/:path*",
        permanent: true,
      },
      // If users land on other www.wideget.net paths, forward to the canonical host.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wideget.net" }],
        destination: "https://castfolio.wideget.net/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
