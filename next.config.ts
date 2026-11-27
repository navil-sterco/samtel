import type { NextConfig } from "next";

const revalidateSeconds = Number(
  process.env.NEXT_PUBLIC_REVALIDATE ?? 360
);

// HTML / dynamic responses: short browser cache, CDN cache + SWR.
const pageCacheControl = `public, max-age=0, s-maxage=${revalidateSeconds}, stale-while-revalidate=86400`;
// Unhashed files in /public: cache a month, revalidate in the background.
const staticCacheControl =
  "public, max-age=2592000, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  experimental: {
    optimizeCss: true,
    cssChunking: true, 
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
      // /_next/static is deliberately excluded: Next already serves it as
      // `public, max-age=31536000, immutable`, which the old catch-all overrode.
      {
        // Everything except Next's build output and /public asset folders
        source: "/((?!_next/|assets/|js/).*)",
        headers: [{ key: "Cache-Control", value: pageCacheControl }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: staticCacheControl }],
      },
      {
        source: "/js/:path*",
        headers: [{ key: "Cache-Control", value: staticCacheControl }],
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
        destination: "https://www.samtelavionics.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;