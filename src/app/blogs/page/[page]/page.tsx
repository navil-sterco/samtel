import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageSEO } from "@/lib/seo";
import BlogsListing from "@/components/blogs/BlogsListing";
import { apiFetch } from "@/lib/api";

type Params = Promise<{ page: string }>;

function parsePage(value: string): number | null {
    if (!/^\d+$/.test(value)) return null;
    const n = Number(value);
    return n >= 1 ? n : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { page } = await params;
    const n = parsePage(page);
    const seo = await getPageSEO("blogs");
    const title = typeof seo.title === "string" ? seo.title : seo.title.absolute;

    let openGraph: Metadata["openGraph"] = seo.openGraph
                ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
                : undefined;
                    
                const hasOgImage = Array.isArray(openGraph?.images)
                    ? openGraph.images.length > 0
                    : Boolean(openGraph?.images);
                    
                let fallbackImage: string | null = null;
                    
                if (!hasOgImage) {
                    const { data } = await apiFetch(`blogs/page/${page}`);
                    fallbackImage = data?.products?.data[0]?.image
        
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

export default async function BlogsPaginatedPage({ params }: { params: Params }) {
    const { page } = await params;
    const n = parsePage(page);

    if (n === null) notFound();
    if (n === 1) redirect("/blogs");

    return <BlogsListing page={n} />;
}