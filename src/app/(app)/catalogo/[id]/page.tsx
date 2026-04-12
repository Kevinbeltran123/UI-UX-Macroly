import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data }, { data: allData }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("products").select("*").order("name"),
  ]);

  if (!data) notFound();

  return (
    <ProductDetailClient
      product={mapProduct(data)}
      allProducts={(allData ?? []).map(mapProduct)}
    />
  );
}
