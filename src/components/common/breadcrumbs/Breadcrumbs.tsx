"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import "./breadcrumbs.css";

import { BASE_URL, CANONICAL_ORIGIN } from "@/config/config";

export interface BreadcrumbsInterface {
  title: string;
  slug: string;
  overwrite_url?: string | null;
  target_blank?: number | boolean;
}

export interface BreadcrumbPropsInterface {
  data: {
    breadcrumbs?: BreadcrumbsInterface[];
  };
  isModal?: boolean;
}

export default function Breadcrumbs({
  data,
  isModal = false,
}: BreadcrumbPropsInterface) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 575);
    };

    checkWidth();

    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);
  
  const breadcrumbs = data?.breadcrumbs ?? [];

  const allBreadcrumbs = [
    {
      title: "Home",
      slug: BASE_URL ?? "/",
      overwrite_url: null,
      target_blank: 0,
      isHome: true,
    },

    ...breadcrumbs.map((item) => ({ ...item, isHome: false })),
  ];

  const schemaOrigin = CANONICAL_ORIGIN
    ? new URL("/", CANONICAL_ORIGIN).toString()
    : null;
  const pathSegments: string[] = [];
  const schemaItems = breadcrumbs.flatMap((item, index) => {
    const title = item.title?.trim();
    if (!title || title.toLowerCase() === "home" || !schemaOrigin) return [];

    const slug = item.slug?.trim();
    let slugPath = "";
    if (slug && slug !== "#") {
      if (/^[a-z][a-z\d+.-]*:\/\//i.test(slug)) {
        slugPath = slug;
      } else if (slug.startsWith("/") || slug.includes("/")) {
        const segments = slug.split("/").filter(Boolean);
        pathSegments.splice(0, pathSegments.length, ...segments);
        slugPath = slug;
      } else {
        pathSegments.push(slug);
        slugPath = pathSegments.join("/");
      }
    }

    const overwriteUrl = item.overwrite_url?.trim();
    const path =
      (overwriteUrl && overwriteUrl !== "#" ? overwriteUrl : slugPath) ||
      (index === breadcrumbs.length - 1 ? pathname : "");
    if (!path || path === "#") return [];

    try {
      const url = new URL(path, schemaOrigin);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        console.error(`Invalid breadcrumb URL for "${title}": ${path}`);
        return [];
      }
      return [{ "@type": "ListItem", name: title, item: url.toString() }];
    } catch (error) {
      console.error(`Invalid breadcrumb URL for "${title}": ${path}`, error);
      return [];
    }
  });
  const breadcrumbSchema = schemaOrigin
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: schemaOrigin,
          },
          ...schemaItems.map((item, index) => ({
            ...item,
            position: index + 2,
          })),
        ],
      }
    : null;

  const visibleBreadcrumbs =
    isMobile && !isExpanded ? allBreadcrumbs.slice(-2) : allBreadcrumbs;

  const showDots = isMobile && allBreadcrumbs.length > 2;

  return (
    <section className={`breadcrumb-sec ${isModal ? "modal-breadcrumb" : ""}`}>
      {!isModal && breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <div className="container">
        <div className="col-lg-10 mx-auto">
          <nav aria-label="breadcrumb" className="breadcrumb-custom">
            <ol
              className={`breadcrumb ${isExpanded ? "breadcrumb-expanded" : ""}`}
            >
              {showDots && (
                <li className="breadcrumb-collapsed">
                  <button
                    type="button"
                    className="dots-icon expand-breadcrumbs"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    aria-label={
                      isExpanded ? "Collapse breadcrumbs" : "Expand breadcrumbs"
                    }
                    aria-expanded={isExpanded}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 10 30"
                      width="10"
                      height="30"
                      className="breadcrumb-dots-icon"
                    >
                      <circle cx="5" cy="5" r="2" fill="#C83030" />

                      <circle cx="5" cy="15" r="2" fill="#C83030" />

                      <circle cx="5" cy="25" r="2" fill="#C83030" />
                    </svg>
                  </button>
                </li>
              )}

              {visibleBreadcrumbs.map((item, idx) => {
                const isLast =
                  allBreadcrumbs.indexOf(item) === allBreadcrumbs.length - 1;

                return (
                  <li
                    key={item.slug + idx}
                    className={`breadcrumb-item ${isLast ? "active" : ""}`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.isHome ? (
                      <Link href={BASE_URL ?? "/"}>Home</Link>
                    ) : isLast ||
                      // String(item.slug).includes("#") ||
                      item.slug === "media" ? (
                      item.title
                    ) : (
                      <Link href={`${item.target_blank ? `${item.overwrite_url || item.slug}` : `${BASE_URL}${item.overwrite_url || item.slug}`}`} target={item.target_blank ? '_blank' : '_self'}>{item.title}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
