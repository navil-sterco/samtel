import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";

import '@/styles/inner.css'
import ScrollToTop from "@/components/common/ScrollToTop";
import { notFound } from "next/navigation";


export default async function CurrentOpeningPageLayout({ children }: { children: React.ReactNode }) {
    const {data, error} = await apiFetch(`cms/current-opening`);

    if(error ) notFound();

    const topData = data?.data || {};

    return (
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {children}
            <ScrollToTop />
        </>
    )
}