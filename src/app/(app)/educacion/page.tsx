import { createClient } from "@/lib/supabase/server";
import { mapArticle } from "@/lib/supabase/mappers";
import { EducacionClient } from "./educacion-client";

export default async function EducacionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("reading_time");
  const articles = (data ?? []).map(mapArticle);

  return <EducacionClient articles={articles} />;
}
