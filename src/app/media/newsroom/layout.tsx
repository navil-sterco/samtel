import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";

import '@/styles/inner.css'
import { notFound } from "next/navigation";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSEO("media/newsroom");

    let openGraph: Metadata["openGraph"] = seo.openGraph
        ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
        : undefined;
            
        const hasOgImage = Array.isArray(openGraph?.images)
            ? openGraph.images.length > 0
            : Boolean(openGraph?.images);
            
        let fallbackImage: string | null = null;
            
        if (!hasOgImage) {
            const { data } = await apiFetch(`gallery`);
            fallbackImage = data?.data?.data[0]?.mapping_items?.gallery[0].upload_media

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

export default async function DynamicPageLayout({ children }: { children: React.ReactNode }) {
    const {data, error} = await apiFetch(`cms/newsroom`);

    if(error || !data.status){
        return notFound();
    }

    const topData = data?.data || {};
    const updatedTopData = {...topData, description:''}

    return (
        <>
            <InnerSection data={updatedTopData} />
            {children}
        </>
    )
}