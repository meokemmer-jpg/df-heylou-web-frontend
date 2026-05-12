import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  env: {
    HEYLOU_WEB_SANDBOX: process.env.HEYLOU_WEB_SANDBOX ?? "true",
  },
  // CRUX-MK: Strict CSP-Headers for Brand-Identity-Integrity
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
