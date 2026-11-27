import { cache } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsPage from "@/components/product-solutions/ProductDetailsPage";
import { apiFetch } from "@/lib/api";
import { getPageSEO } from "@/lib/seo";
import "@/styles/inner.css";
import "./product-detail-page.css";
import InnerSection from "@/components/common/innerSection/InnerSection";
import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";

interface Product {
    id: string | number;
    name: string;
    slug: string;
    image?: string;
    image_caption?: string;
    description?: string;
    padding?: string;
    mapping_items?: {
        lists?: Array<{
            title?: string | null;
            description?: string;
        }>;
        images?: Array<{
            image?: string;
            caption?: string;
        }>;
    };
}

interface Category {
    name: string;
    slug: string;
}

interface CategoriesResponse {
    status?: boolean;
    data?: Category[];
}

interface ProductsResponse {
    status?: boolean;
    category?: Category;
    products?: {
        data?: Product[];
        last_page?: number;
    };
}

type RouteParams = {
    slug: string;
    productSlug: string;
};

const getProductDetails = cache(async (categorySlug: string, productSlug: string) => {
    const [{ data: categoriesData, error: categoriesError }, firstProductsResponse] =
        await Promise.all([
            apiFetch("product-categories", { revalidate: 60 }),
            apiFetch(`product/${encodeURIComponent(categorySlug)}?page=1`, { revalidate: 60 }),
        ]);

    const categories = (categoriesData as CategoriesResponse | null)?.data ?? [];
    const category = categories.find((item) => item.slug === categorySlug);
    const productsData = firstProductsResponse.data as ProductsResponse | null;

    if (categoriesError || !category || firstProductsResponse.error || !productsData?.status) {
        notFound();
    }

    const findProduct = (products: Product[] = []) =>
        products.find((item) => item.slug === productSlug);

    const firstPageProduct = findProduct(productsData.products?.data);
    if (firstPageProduct) return { category, product: firstPageProduct };

    const lastPage = productsData.products?.last_page ?? 1;
    for (let page = 2; page <= lastPage; page += 1) {
        const { data, error } = await apiFetch(
            `product/${encodeURIComponent(categorySlug)}?page=${page}`,
            { revalidate: 60 },
        );
        if (error) notFound();

        const product = findProduct((data as ProductsResponse | null)?.products?.data);
        if (product) return { category, product };
    }

    notFound();
});

export async function generateMetadata({
    params,
}: {
    params: Promise<RouteParams>;
}): Promise<Metadata> {
    const { slug: categorySlug, productSlug } = await params;
    const [{ product }, seo] = await Promise.all([
        getProductDetails(categorySlug, productSlug),
        getPageSEO(`${categorySlug}/${productSlug}`),
    ]);
    const seoTitle = typeof seo.title === "string" ? seo.title : seo.title.absolute;
    const hasProductSpecificSeo = seoTitle !== "Samtel";
    const seoDescription = seo.description === "Samtel" ? product.description : seo.description;

    return {
        title: hasProductSpecificSeo ? seo.title : product.name,
        description: seoDescription,
        keywords: seo.keywords,
        alternates: seo.alternates,
        robots: seo.robots,
        openGraph: {
            ...(seo.openGraph ?? {}),
            siteName: seo.openGraph?.siteName ?? undefined,
            title: hasProductSpecificSeo ? seo.openGraph?.title || seoTitle : product.name,
            description: seo.openGraph?.description === "Samtel Avionics"
                ? seoDescription
                : seo.openGraph?.description || seoDescription,
            images: seo.openGraph?.images?.length
                ? seo.openGraph.images
                : product.image
                    ? [{ url: product.image }]
                    : [],
        },
        twitter: product.image
            ? { card: "summary_large_image", images: [product.image] }
            : undefined,
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { slug: categorySlug, productSlug } = await params;
    const [{ category, product }, requestHeaders, {data:productCMSData}] = await Promise.all([
        getProductDetails(categorySlug, productSlug),
        headers(),
        apiFetch(`cms/product-solutions`)
    ]);

    const topData = productCMSData?.data || {};

    const nonce = requestHeaders.get("x-nonce") ?? undefined;
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        ...(product.image ? { image: [product.image] } : {}),
        ...(product.description ? { description: product.description } : {}),
        brand: {
            "@type": "Brand",
            name: "Samtel Avionics",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
                }}
            />
            <div className="product_detail_page_main">
                <InnerSection data={topData} />
                <Breadcrumbs data={topData} />
                <ProductDetailsPage product={product} category={category} />
            </div>
        </>
    );
}
