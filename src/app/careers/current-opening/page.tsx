import KekaJobs from "@/components/career/KekaJobs";
import { apiFetch } from "@/lib/api";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("careers/current-opening");

  let openGraph: Metadata["openGraph"] = seo.openGraph
        ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
        : undefined;
          
      const hasOgImage = Array.isArray(openGraph?.images)
          ? openGraph.images.length > 0
          : Boolean(openGraph?.images);
          
      let fallbackImage: string | null = null;
          
      if (!hasOgImage) {
          const { data } = await apiFetch(`cms/current-opening`);
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

export default function CurrentOpeningPage() {
  return (
    <>
      <section className="apply_sec">
        <div className="container">
          <div className="col-lg-10 mx-auto">
            <KekaJobs />
          </div>
        </div>
      </section>

    </>
  );
}