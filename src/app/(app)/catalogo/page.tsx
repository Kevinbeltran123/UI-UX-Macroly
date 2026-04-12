import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { CatalogoClient } from "./catalogo-client";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const mapped = (products ?? []).map(mapProduct);
  const cats = (categories ?? []).map((c) => ({ id: c.id as string, label: c.label as string }));

  return <CatalogoClient products={mapped} categories={cats} />;
}
