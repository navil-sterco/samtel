import ProductSolutionsClient from "@/components/product-solutions/ProductSolutionsClient";
import { apiFetch } from "@/lib/api"
import { getFirstImageFromSections } from "@/lib/extractFirstImage";
import { getPageSEO } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export async function generateMetadata({params}: { params: Promise<{ type?: string }> }) {
    const { type } = await params;
    const seo = await getPageSEO(`product-solutions/${type}`);

    let openGraph: Metadata["openGraph"] = seo.openGraph
            ? { ...seo.openGraph, siteName: seo.openGraph.siteName ?? undefined }
            : undefined;
                
            const hasOgImage = Array.isArray(openGraph?.images)
                ? openGraph.images.length > 0
                : Boolean(openGraph?.images);
                
            let fallbackImage: string | null = null;
                
            if (!hasOgImage) {
                const { data } = await apiFetch(`product/${type}`);
                fallbackImage = data?.products?.data[0]?.image
    
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

interface MappingItemInterface{
    title?:string;
    description?:string;
}

interface ProductMappingImage {
    image?: string;
}

interface ProductDataInterface {
    name: string;
    image?: string;
    ['product-category']: string;
    slug: string;
    id: string;
    description?: string;
    details?: string;
    content?: string;
    product_details?: string;
    product_details_html?: string;
    mapping_items?:{
        lists?:MappingItemInterface[];
        images?:ProductMappingImage[];
    }
}

interface ProductsDataInterface {
    products: {
        current_page: number;
        data: ProductDataInterface[];
        last_page: number;
    },
}

interface ProductCategoryInterface {
    name: string;
    slug: string;
}

interface CategoryInterface {
    data: ProductCategoryInterface[];
}

interface ProductCategoryDetailInterface {
    name?: string;
    image?: string;
    description?: string;
    subtitle?:string;
}

export default async function ProductTypePage({params, searchParams }: { params: Promise<{ type?: string }>; searchParams: Promise<{ page?: string; type?:string }> }) {
    const {type} = await params;
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;

    const { data: ProductCategoriesData } = await apiFetch(`product-categories`, {revalidate:60});
    const productCategories = (ProductCategoriesData as CategoryInterface)?.data ?? [];

    const activeType = productCategories.some((category) => category.slug === type)
        && type;

    console.log('activeType',activeType);

    const [{ data }, { data: categoryResponse }] = activeType
        ? await Promise.all([
            apiFetch(`product/${encodeURIComponent(activeType)}?page=${currentPage}`, {revalidate:60}),
            apiFetch(`product-category/${encodeURIComponent(activeType)}`, {revalidate:60}),
        ])
        : [{ data: null }, { data: null }];

    console.log('product solutions data', data);

    if(!data?.status) notFound();

    const apiData = (data as ProductsDataInterface)?.products;
    const productsData = apiData?.data ?? [];
    const category = categoryResponse?.data?.productCategory?.data as ProductCategoryDetailInterface | undefined;
    const nonce = (await headers()).get("x-nonce") ?? undefined;
    const productSchema = category?.name
        ? {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: category.name,
            ...(category.image ? { image: category.image } : {}),
            ...(category.subtitle ? { description: category.subtitle } : {}),
            brand: {
                "@type": "Brand",
                name: "Samtel Avionics",
            },
        }
        : null;

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    nonce={nonce}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
                    }}
                />
            )}
            <ProductSolutionsClient
                categories={productCategories}
                activeCategory={productCategories.find((category) => category.slug === activeType)}
                products={productsData}
                currentPage={apiData?.current_page || 1}
                totalPages={apiData?.last_page || 1}
            />
        </>
    );
}