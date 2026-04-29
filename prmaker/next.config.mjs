import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import("next").NextConfig} */
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
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wideget.net" }],
        destination: "https://castfolio.wideget.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
