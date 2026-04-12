import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();

  if (!data) notFound();

  return <ProductDetailClient product={mapProduct(data)} />;
}
