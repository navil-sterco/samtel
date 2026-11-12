import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";
// import { getSlug } from "@/lib/getSlug";

import '@/styles/inner.css'
import { notFound } from "next/navigation";

export default async function ProductLayoutPage({ children }: { children: React.ReactNode }) {
    // const slug = await getSlug();
    const {data, error} = await apiFetch(`cms/product-solutions`);

    if(error || !data.status){
        return notFound()
    }

    const topData = data?.data || {};

    return (
        <>
            <InnerSection data={topData} />
            <Breadcrumbs data={topData} />
            {children}
        </>
    )
}