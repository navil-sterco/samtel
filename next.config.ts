import type { NextConfig } from "next";

const revalidateSeconds = Number(process.env.NEXT_PUBLIC_REVALIDATE ?? 360);
const cacheControl = `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=86400`;

const nextConfig: NextConfig = {
  // Keep dynamically generated metadata in <head> for every user agent.
  htmlLimitedBots: /.*/,
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  images:{
    remotePatterns:[
      {protocol:"https", hostname:"**"},
      {protocol:"http", hostname:"**"}
    ],
    // unoptimized:true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // X-Frame-Options removed — frame-ancestors in CSP handles this now
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: cacheControl,
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://project-demo.in/samtel/api/:path*",
      },
    ];
  },
};

export default nextConfig;
