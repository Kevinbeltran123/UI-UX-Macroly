import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";
import { InicioClient } from "./inicio-client";

export default async function InicioPage() {
  const supabase = await createClient();

  const [{ data: user }, { data: products }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("products").select("*").order("name"),
  ]);

  const firstName = user.user?.user_metadata?.full_name?.split(" ")[0] ?? "Usuario";
  const allProducts = (products ?? []).map(mapProduct);

  return <InicioClient firstName={firstName} allProducts={allProducts} />;
}
