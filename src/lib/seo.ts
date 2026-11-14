import { SEO_URL } from "@/config/config";
import { cache } from "react";
import { CANONICAL_ORIGIN } from "@/config/config";

type OpenGraphType =
  | "website"
  | "article"
  | "book"
  | "profile"
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "video.tv_show"
  | "video.other"
  | "video.movie"
  | "video.episode";

type OpenGraphImage =
  | string
  | URL
  | {
      url: string | URL;
      secureUrl?: string | URL;
      alt?: string;
      type?: string;
      width?: string | number;
      height?: string | number;
      [key: string]: unknown;
    };

type SEOResult = {
  title: string | { absolute: string };
  description: string;
  keywords: string;
  alternates: { canonical: string };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
    };
  };
  openGraph?: {
    title: string;
    description: string;
    type: OpenGraphType;
    images: OpenGraphImage[];
    url: string;
  };
  schema: Record<string, unknown> | null;
};

function defaultSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Article Title",
    description: "Article Description",
    image: "https://yoursite.com/image.jpg",
    datePublished: "2024-01-01",
    author: { "@type": "Person", name: "Samtel" },
  };
}

function canonicalForSlug(slug: string): string {
  const path = !slug || slug === "home" ? "/" : `/${slug.replace(/^\/+/, "")}`;
  return new URL(path, CANONICAL_ORIGIN).toString();
}

function defaultSEO(slug = ""): SEOResult {
  return {
    title: "Samtel",
    description: "Samtel",
    keywords: "Samtel",
    alternates: { canonical: canonicalForSlug(slug) },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    schema: null,
  };
}

async function fetchGlobalRobots(): Promise<SEOResult["robots"] | null> {
  try {
    const res = await fetch(`${SEO_URL}seo/global`, {
      cache: "force-cache",
      next: { revalidate: 360 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const robots = data?.data?.robots;

    if (typeof robots?.index !== "boolean" && typeof robots?.follow !== "boolean") {
      return null;
    }

    const index = robots.index ?? true;
    const follow = robots.follow ?? true;

    return {
      index,
      follow,
      googleBot: { index, follow },
    };
  } catch {
    return null;
  }
}

async function fetchPageSEO(slug: string): Promise<SEOResult> {
  const globalRobotsPromise = fetchGlobalRobots();

  try {
    const globalRobots = await globalRobotsPromise;
    if (!slug) {
      return { ...defaultSEO(slug), robots: globalRobots ?? defaultSEO(slug).robots };
    }

    const encodedSlug = slug
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const res = await fetch(`${SEO_URL}seo/${encodedSlug}`, {
      cache: "force-cache",
      next: { revalidate: 360 },
    });

    if (!res.ok) throw new Error("SEO data not found");

    const data = await res.json();
    const pageRobots = data.data.robots;
    const index = pageRobots?.index ?? globalRobots?.index ?? true;
    const follow = pageRobots?.follow ?? globalRobots?.follow ?? true;
    return {
      title: { absolute: data.data.title },
      description: data.data.description,
      keywords: data.data.keywords?.length > 0 ? data.data.keywords : "Samtel",
      robots: {
        index,
        follow,
        googleBot: { index, follow },
      },
      alternates: {
        canonical: data.data.alternates?.canonical || canonicalForSlug(slug),
      },
      openGraph: {
        title: data.data.openGraph?.title || data.data.title || "Samtel",
        description: data.data.openGraph?.description || data.data.description || "Samtel",
        type: data.data.openGraph?.type || "website",
        images: data.data.openGraph?.images || [],
        url:
          data.data.openGraph?.url ||
          data.data.alternates?.canonical ||
          canonicalForSlug(slug),
      },
      schema: data.data.schema || defaultSchema(),
    };
  } catch {
    const globalRobots = await globalRobotsPromise;
    return { ...defaultSEO(slug), robots: globalRobots ?? defaultSEO(slug).robots };
  }
}

export const getPageSEO = cache(fetchPageSEO);
