import BlogsListing from "@/components/blogs/BlogsListing";
import { apiFetch } from "@/lib/api";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSEO("blogs");

    let openGraph: Metadata["openGraph"] = seo.openGraph
        ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
        : undefined;
    
        // Check whether the SEO API provided an og:image
    const hasOgImage = Array.isArray(openGraph?.images)
        ? openGraph.images.length > 0
        : Boolean(openGraph?.images);
    
    let fallbackImage: string | null = null;
    
    if (!hasOgImage) {
        const { data } = await apiFetch(`blogs`);
        fallbackImage = data?.data[0]?.image_url;

        if (fallbackImage) {
          openGraph = {
            ...(openGraph ?? {}),
            images: [{ url: fallbackImage }],
          } as Metadata["openGraph"];
        }
    }

    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        alternates: seo.alternates,
        robots: seo.robots,
        openGraph,
        twitter: fallbackImage
            ? { card: "summary_large_image", images: [fallbackImage] }
        : undefined,
    };
}

export default function BlogsPage() {
    return <BlogsListing page={1} />;
}
