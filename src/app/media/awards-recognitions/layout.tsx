import Breadcrumbs from "@/components/common/breadcrumbs/Breadcrumbs";
import InnerSection from "@/components/common/innerSection/InnerSection";
import { apiFetch } from "@/lib/api";
import "@/styles/inner.css";
import { notFound } from "next/navigation";


export default async function AwardsRecognitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, error } = await apiFetch(`cms/awards-recognitions`);

  if (error || !data?.status) notFound();

  const topData = data?.data || {};

  return (
    <>
      <InnerSection data={topData} />
      <Breadcrumbs data={topData} />
      {children}
    </>
  );
}