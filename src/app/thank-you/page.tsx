import Link from "next/link";
import "./thank-you.css";
import { BASE_URL } from "@/config/config";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { apiFetch } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("thank-you");

  let openGraph: Metadata["openGraph"] = seo.openGraph
      ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
      : undefined;
  
    const hasOgImage = Array.isArray(openGraph?.images)
      ? openGraph.images.length > 0
      : Boolean(openGraph?.images);
  
    let fallbackImage: string | null = null;
  
    if (!hasOgImage) {
      const { data } = await apiFetch(`cms/thank-you`);
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

export default function ThankYouPage() {
  return (
    <main className="thank_you">
      <div className="thank_you_card">
        <h1 className="heading">
          Thank You for Contacting Us!
        </h1>

        <p className="message">
          We have received your inquiry successfully. Our team will get in touch
          with you shortly.
        </p>

        <div>
          <Link
            href={BASE_URL ?? "/"}
            className="back_btn"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}