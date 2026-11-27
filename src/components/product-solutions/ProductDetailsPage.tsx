"use client";

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
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

interface ProductDetailsPageProps {
    product: Product;
    category: {
        name: string;
        slug: string;
    };
}

const placeholderImage = "/assets/images/placeholders/product.webp";

export default function ProductDetailsPage({ product, category }: ProductDetailsPageProps) {
    const images = [
        ...(product.image ? [{ src: product.image, caption: product.image_caption }] : []),
        ...(product.mapping_items?.images ?? [])
            .filter((item): item is { image: string; caption?: string } => Boolean(item.image))
            .map((item) => ({ src: item.image, caption: item.caption })),
    ].filter((image, index, allImages) =>
        allImages.findIndex((candidate) => candidate.src === image.src) === index,
    );
    const slides = images.length ? images : [{ src: placeholderImage, caption: undefined }];

    const openImageGallery = (startIndex: number) => {
        Fancybox.show(
            images.map(({ src, caption }) => ({
                src,
                type: "image",
                caption: caption || product.name,
            })),
            { startIndex },
        );
    };

    const breadcrumbData = {
        breadcrumbs: [
            { title: "Products & Solutions", slug: "product-solutions" },
            { title: category.name, slug: `product-solutions/${category.slug}` },
            { title: product.name, slug: "" },
        ],
    };

    return (
        <main className="product-detail-page">
            <div className="product_modal_content">
                <div className="product_modal_close">
                    <Link
                        href={`/product-solutions/${category.slug}`}
                        className="product-detail-back"
                    >
                        Back
                    </Link>
                </div>

                <div className="container-full">
                    <div className="product_modal_grid">
                        <div className="product_image">
                            <figure>
                                <Swiper
                                    key={product.id}
                                    className="product-image-swiper"
                                    modules={[Pagination, Autoplay, Navigation]}
                                    slidesPerView={1}
                                    loop={images.length > 1}
                                    autoplay={{
                                        delay: 3000,
                                        disableOnInteraction: false,
                                    }}
                                    navigation={{
                                        nextEl: ".product-detail-next",
                                        prevEl: ".product-detail-prev",
                                    }}
                                >
                                    {slides.map((item, index) => (
                                        <SwiperSlide
                                            key={`${item.src}-${index}`}
                                            className={product.padding ? "padding" : ""}
                                        >
                                            <Image
                                                src={item.src}
                                                className="img-fluid w-100"
                                                width={850}
                                                height={850}
                                                alt={product.name}
                                                priority={index === 0}
                                            />
                                            {item.caption && (
                                                <div className="image_title">
                                                    <h6>{item.caption}</h6>
                                                </div>
                                            )}
                                            {images.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="product-image-zoom"
                                                    aria-label={`Zoom image ${index + 1} of ${product.name}`}
                                                    onClick={() => openImageGallery(index)}
                                                >
                                                    <Image
                                                        src="/assets/icons/zoombtn.svg"
                                                        alt="zoom icon"
                                                        width={39}
                                                        height={39}
                                                    />
                                                </button>
                                            )}
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="swiper_custom_prev product-detail-prev"
                                            aria-label="Previous product image"
                                        >
                                            <Image
                                                src="/assets/icons/left-arrow.svg"
                                                alt="left arrow"
                                                width={52}
                                                height={52}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="swiper_custom_next product-detail-next"
                                            aria-label="Next product image"
                                        >
                                            <Image
                                                src="/assets/icons/right-arrow-white.svg"
                                                alt="right arrow"
                                                width={52}
                                                height={52}
                                            />
                                        </button>
                                    </>
                                )}
                            </figure>
                        </div>

                        <div>
                            <Breadcrumbs data={breadcrumbData} />
                            <div className="product_content">
                                <h1 className="font45" id="product-detail-title">
                                    {product.name}
                                </h1>
                                <div id="modalDynamicBody">
                                    {product.description && (
                                        <div className="sort_desc_bx">
                                            <p
                                                dangerouslySetInnerHTML={{
                                                    __html: product.description,
                                                }}
                                            />
                                        </div>
                                    )}
                                    {product.mapping_items?.lists?.map((item, index) => (
                                        <div key={index}>
                                            <h3
                                                dangerouslySetInnerHTML={{
                                                    __html: item.title || "",
                                                }}
                                            />
                                            <div
                                                className="produc_btmdesc"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.description || "",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
