import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { InicioClient } from "./inicio-client";

export default async function InicioPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const allProducts = (products ?? []).map(mapProduct);

  return <InicioClient allProducts={allProducts} />;
}
