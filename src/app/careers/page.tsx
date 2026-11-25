import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import ComingSoon from "@/components/common/comingSoon/ComingSoon";
import InnerSection from "@/components/common/innerSection/InnerSection";
import ReactParserDynamic from "@/components/common/reactParser/ReactParserDynamic";
import ScrollToTop from "@/components/common/ScrollToTop";
import { apiFetch } from "@/lib/api";
import { getPageSEO } from "@/lib/seo";
import { notFound } from "next/navigation";
import '@/styles/inner.css'
import { Metadata } from "next";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";

export async function generateMetadata(){
    const seo = await getPageSEO('careers');

    let openGraph: Metadata["openGraph"] = seo.openGraph
      ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
      : undefined;
        
    const hasOgImage = Array.isArray(openGraph?.images)
        ? openGraph.images.length > 0
        : Boolean(openGraph?.images);
        
    let fallbackImage: string | null = null;
        
    if (!hasOgImage) {
        const { data } = await apiFetch(`cms/careers`);
        fallbackImage = getFirstImageFromSections(data?.data?.sections, 2);
    
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

export default async function CareerPage({params, searchParams}:{params:Promise<{slug:string}>; searchParams?:Promise<{page?:string}>}){
    const {slug} = await params;
    const {data, error} = await apiFetch(`cms/careers`);

    if(error || !data.status) notFound();
    
    const topData = data?.data || {};

    const combinedHtml = Object.values(data?.data?.sections ?? {}).join(''); 

    return(
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {data.data.sections.length == 0 ? <ComingSoon /> : <ReactParserDynamic html={combinedHtml} searchParams={searchParams} />}
            <ScrollToTop />
        </>
    )
}