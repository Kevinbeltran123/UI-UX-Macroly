import { createClient } from "@/lib/supabase/server";
import { HistorialClient } from "./historial-client";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return <HistorialClient orders={orders ?? []} />;
}
