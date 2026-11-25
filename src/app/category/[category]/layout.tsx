import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";
import '@/styles/inner.css'
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";

type PageProps = {
    children: React.ReactNode;
    params: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category } = await params;
    const seo = await getPageSEO(`category/${category}`);

    let openGraph: Metadata["openGraph"] = seo.openGraph
            ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
            : undefined;
              
          const hasOgImage = Array.isArray(openGraph?.images)
              ? openGraph.images.length > 0
              : Boolean(openGraph?.images);
              
          let fallbackImage: string | null = null;
              
          if (!hasOgImage) {
              const { data } = await apiFetch(`product-category/${category}`);
              fallbackImage = getFirstImageFromSections(data?.data?.productCategory?.cms);
          
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

export default async function CategoryPageLayout({ children, params }: PageProps) {
    const {category} = await params;
    const {data, error} = await apiFetch(`product-category/${category}`);

    if(error || !data.status) notFound();

    const topData = data?.data || {};

    return (
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {children}
        </>
    )
}