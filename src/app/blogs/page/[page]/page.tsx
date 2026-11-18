import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPageSEO } from "@/lib/seo";
import BlogsListing from "@/components/blogs/BlogsListing";

type Params = Promise<{ page: string }>;

function parsePage(value: string): number | null {
    if (!/^\d+$/.test(value)) return null;
    const n = Number(value);
    return n >= 1 ? n : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { page } = await params;
    const n = parsePage(page);
    const seo = await getPageSEO("blogs");
    const title = typeof seo.title === "string" ? seo.title : seo.title.absolute;

    return {
        title: { absolute: n && n > 1 ? `${title} - Page ${n}` : title },
        description: seo.description,
        keywords: seo.keywords,
        alternates: { canonical: `/blogs/page/${n ?? 1}` },
        robots: seo.robots,
        openGraph: seo.openGraph ? { ...seo.openGraph } : undefined,
    };
}

export default async function BlogsPaginatedPage({ params }: { params: Params }) {
    const { page } = await params;
    const n = parsePage(page);

    if (n === null) notFound();
    if (n === 1) redirect("/blogs");

    return <BlogsListing page={n} />;
}