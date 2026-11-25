
import type { NextConfig } from "next";

const revalidateSeconds = Number(
  process.env.NEXT_PUBLIC_REVALIDATE ?? 360
);

const cacheControl = `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=86400`;

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  experimental: {
    cssChunking: true, // or 'strict' depending on your Next version
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
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

  
async redirects() {
  return [
    {
      source: "/index.html",
      destination: "/",
      permanent: true,
    },
    {
      source: "/index.php",
      destination: "/",
      permanent: true,
    },
    {
      source: "/:path+/index.html",
      destination: "/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [
          {
              type: "host",
              value: "samtel.vercel.app",
          },
      ],
      destination: "https://www.samtelavionics.com/:path*",
      permanent: true,
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
