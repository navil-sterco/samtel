import ComingSoon from "@/components/common/comingSoon/ComingSoon";
import BlogCommentForm from "@/components/common/forms/BlogCommentForm";
import ReactParserDynamic from "@/components/common/reactParser/ReactParserDynamic";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageSEO } from "@/lib/seo";
import { headers } from "next/headers";

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const seo = await getPageSEO(`blogs/${slug}`);

    let openGraph: Metadata["openGraph"] = seo.openGraph
      ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
      : undefined;
        
    const hasOgImage = Array.isArray(openGraph?.images)
        ? openGraph.images.length > 0
        : Boolean(openGraph?.images);
        
    let fallbackImage: string | null = null;
        
    if (!hasOgImage) {
        const { data } = await apiFetch(`blogs/${slug}`);

        fallbackImage = data?.data?.image_url || null;
    
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

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await apiFetch(`blogs/${slug}`);

  if (error || !data?.success) notFound();

  const pageData = data?.data;

  const combinedHtml = Object.values(pageData?.content ?? {}).join("");
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.samtelavionics.com/blogs/${slug}`,
    },
    headline: pageData?.title,
    description: pageData?.description,
    image: pageData?.image_url,
    author: {
      "@type": "Organization",
      name: "Samtel Avionics",
      url: "https://www.samtelavionics.com/",
    },
    publisher: {
      "@type": "Organization",
      name: "Samtel Avionics",
      logo: {
        "@type": "ImageObject",
        url: "https://www.samtelavionics.com/_next/image?url=%2Fassets%2Fimages%2Fmain-logo.webp&w=256&q=75",
      },
    },
    datePublished: pageData?.created_at,
    dateModified: pageData?.updated_at || pageData?.created_at,
  };

  if (combinedHtml?.length === 0) {
    return <ComingSoon />;
  }

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="company-sec1 newsroom-detail-panel">
        <div className="container">
          <div className="col-lg-10 mx-auto">
            <div className="company-text">
              <div className="date">{formatDate(pageData?.created_at)}</div>
              <h2>{pageData?.title}</h2>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="newsroom_full">
              <figure>
                <Image alt={pageData?.image_alt || pageData?.title} src={pageData?.image_url} className="img-fluid" width={1475} height={603} loading="lazy" />
              </figure>
            </div>

            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="news_panel_text">
                  <ReactParserDynamic html={combinedHtml} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-10 mx-auto">
                <BlogCommentForm id={pageData.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
