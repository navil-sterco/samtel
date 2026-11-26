import Happenings from "@/components/homepage/happenings/Happenings";
import HomeBanner from "@/components/homepage/homeBanner/HomeBanner";
import People from "@/components/homepage/people/People";
import Sustainability from "@/components/homepage/sustainability/Sustainability";
import Technology from "@/components/homepage/technology/Technology";
import WhoWe from "@/components/homepage/whoWe/WhoWe";
import { apiFetch } from "@/lib/api";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";


export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("home");

  let openGraph: Metadata["openGraph"] = seo.openGraph
              ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
              : undefined;
                
            const hasOgImage = Array.isArray(openGraph?.images)
                ? openGraph.images.length > 0
                : Boolean(openGraph?.images);
                
            let fallbackImage: string | null = null;
                
            if (!hasOgImage) {
                const { data } = await apiFetch(`home-page`);
                fallbackImage = data?.data?.people?.image;
            
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

export default async function Home() {
  const {data, error} = await apiFetch(`home-page`);

  const pageData = data?.data;

  if (!data || error) {
    return <div className="min-h-[100vh] flex items-center justify-center">
      <h1 className="md:!text-[5rem] !text-[2rem] md:!font-bold !font-normal">Something wrong...</h1>
    </div>
  }

  const whoWeData = {...pageData?.who_we, categories:data?.modular?.['product-category'] ?? []};
  const happeningData = {...pageData?.news_and_events, happeningsData:data?.latestModuleEntries ?? []};

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/videos/home-banner-poster.webp"
        fetchPriority="high"
      />
      <main className="homepage-content">
        <HomeBanner data={pageData?.banner} />
        <WhoWe data={whoWeData} />
        <Technology data={pageData?.technology ?? {}} />
        <People data={pageData?.people ?? {}} />
        <Sustainability data={pageData?.sustainability ?? {}} />
        <Happenings data={happeningData} />
      </main>
    </>
  );
}
