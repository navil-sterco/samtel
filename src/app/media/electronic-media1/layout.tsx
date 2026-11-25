import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import '@/styles/inner.css'
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
    const seo = await getPageSEO("media/electronic-media1");

    let openGraph: Metadata["openGraph"] = seo.openGraph
    ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
    : undefined;
        
    const hasOgImage = Array.isArray(openGraph?.images)
        ? openGraph.images.length > 0
        : Boolean(openGraph?.images);
        
    let fallbackImage: string | null = null;
        
    if (!hasOgImage) {
        const { data } = await apiFetch(`award-recognition`);
        fallbackImage = data?.data?.data[0]?.image

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

export default async function MediaCoverageLayout({ children }: { children: React.ReactNode }) {
    const {data, error} = await apiFetch(`modular/electronic-media`);

    if(error || !data.status){
        notFound()
    }

    const topData = data?.data || {};

    return (
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {children}
        </>
    )
}