import { createClient } from "@/lib/supabase/server";
import { PerfilClient } from "./perfil-client";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: goals }, { data: recurring }] = await Promise.all([
    supabase.from("macro_goals").select("*").eq("user_id", user?.id).single(),
    supabase.from("recurring_orders").select("*").eq("user_id", user?.id).eq("active", true).single(),
  ]);

  return (
    <PerfilClient
      userMeta={user?.user_metadata ?? {}}
      goals={goals}
      recurring={recurring}
    />
  );
}
