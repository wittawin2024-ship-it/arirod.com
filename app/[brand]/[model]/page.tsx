import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand, getModel } from "@/lib/db";
import CarDetailClient from "@/components/CarDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}): Promise<Metadata> {
  const { brand, model } = await params;
  const modelData = await getModel(brand, model);
  if (!modelData) return { title: "ไม่พบรุ่นรถนี้" };

  return {
    title: modelData.seo.title,
    description: modelData.seo.description,
    keywords: modelData.seo.keywords,
    alternates: { canonical: `https://arairod.com/${brand}/${model}` },
  };
}

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; model: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { brand, model } = await params;
  const sParams = await searchParams;
  const modelData = await getModel(brand, model);
  if (!modelData) notFound();

  const brandInfo = await getBrand(brand);

  const breadcrumbs = [
    { label: "หน้าแรก", href: "/" },
    { label: brandInfo?.name || brand, href: `/${brand}` },
    { label: modelData.name, href: `/${brand}/${model}` },
  ];

  return (
    <CarDetailClient
      brand={brand}
      model={model}
      modelData={modelData}
      searchParams={sParams}
      breadcrumbs={breadcrumbs}
    />
  );
}
