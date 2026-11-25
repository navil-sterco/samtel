import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";

import '@/styles/inner.css'
import ComingSoon from "@/components/common/comingSoon/ComingSoon";
import ScrollToTop from "@/components/common/ScrollToTop";
import { notFound } from "next/navigation";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";

type PageProps = {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const seo = await getPageSEO(`engineering-design/${slug}`);

    let openGraph: Metadata["openGraph"] = seo.openGraph
        ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
        : undefined;
            
        const hasOgImage = Array.isArray(openGraph?.images)
            ? openGraph.images.length > 0
            : Boolean(openGraph?.images);
            
        let fallbackImage: string | null = null;
            
        if (!hasOgImage) {
            const { data } = await apiFetch(`cms/${slug}`);
            fallbackImage = getFirstImageFromSections(data?.data?.sections);
        
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

export default async function DynamicPageLayout({ children, params }: PageProps) {
    const { slug } = await params;
    const {data, error} = await apiFetch(`cms/${slug}`);

    if(error ) return notFound();

    const topData = data?.data || {};

    return (
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {data.data.sections.length == 0 ? <ComingSoon /> : children}
            <ScrollToTop />
        </>
    )
}