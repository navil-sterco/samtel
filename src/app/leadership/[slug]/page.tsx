import InnerSection from "@/components/common/innerSection/InnerSection";
import ReactParserDynamic from "@/components/common/reactParser/ReactParserDynamic";
import { apiFetch } from "@/lib/api";
import './leadership-detail.css'
import '@/styles/inner.css'
import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { headers } from "next/headers";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const seo = await getPageSEO(`leadership/${slug}`);

    let openGraph: Metadata["openGraph"] = seo.openGraph
        ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
        : undefined;
            
        const hasOgImage = Array.isArray(openGraph?.images)
            ? openGraph.images.length > 0
            : Boolean(openGraph?.images);
            
        let fallbackImage: string | null = null;
            
        if (!hasOgImage) {
            const { data } = await apiFetch(`leadership/${slug}`);
            fallbackImage = getFirstImageFromSections(data?.leadership?.cms);

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

export default async function LeadershipDetailPage({params}:PageProps){
    const {slug} = await params;
    const {data, error} = await apiFetch(`leadership/${slug}`);
    const {data:cmsData} = await apiFetch(`cms/leadership`);
 
    if(error || !data.status) notFound();

    const person = data.leadership?.data;
    const personSchema = person?.name
        ? {
            "@context": "https://schema.org/",
            "@type": "Person",
            name: person.name,
            url: `https://www.samtelavionics.com/leadership/${slug}`,
            ...(person.image ? { image: person.image } : {}),
            ...(person.designation ? { jobTitle: person.designation } : {}),
            worksFor: {
                "@type": "Organization",
                name: "Samtel HAL Display Systems (SHDS)",
            },
        }
        : null;
    const nonce = (await headers()).get("x-nonce") ?? undefined;
    const combinedHtml = Object.values(data?.leadership?.cms ?? {}).join('');
    const descriptionData = cmsData?.data?.description;

    const innerData = {
        page_title:'Leadership', 
        description:descriptionData 
    };

    // const breadcrumb = {
    //     breadcrumbs:[
    //         {
    //             title:'test',
    //             slug:'test'
    //         },
    //     ]
    // }

    return(
        <>
            {personSchema && (
                <script
                    type="application/ld+json"
                    nonce={nonce}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
                    }}
                />
            )}
            <InnerSection data={innerData} />
            <Breadcrumbs data={data?.leadership} />
            <ReactParserDynamic html={combinedHtml} />
        </>
    )
}