import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import ComingSoon from "@/components/common/comingSoon/ComingSoon";
import InnerSection from "@/components/common/innerSection/InnerSection";
import ReactParserDynamic from "@/components/common/reactParser/ReactParserDynamic";
import ScrollToTop from "@/components/common/ScrollToTop";
import { apiFetch } from "@/lib/api";
import { getPageSEO } from "@/lib/seo";
import { notFound } from "next/navigation";
import '@/styles/inner.css'

export async function generateMetadata(){
    const seo = await getPageSEO('careers');

    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        alternates: seo.alternates,
        robots: seo.robots,
        openGraph: seo.openGraph
            ? {
                  ...seo.openGraph,
              }
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