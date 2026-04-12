import { createClient } from "@/lib/supabase/server";
import { mapArticle } from "@/lib/supabase/mappers";
import Link from "next/link";
import { Activity, Dumbbell, Info, Shield, Calendar, ChevronRight } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  activity: Activity,
  dumbbell: Dumbbell,
  info: Info,
  shield: Shield,
  calendar: Calendar,
};

const BG_COLORS = ["bg-protein-light", "bg-protein-light", "bg-carbs-light", "bg-fat-light", "bg-cal-light", "bg-primary-light"];

export default async function EducacionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("reading_time");
  const articles = (data ?? []).map(mapArticle);

  const featured = articles[0];

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      <h1 className="font-display font-black text-xl text-text mb-5">Educacion</h1>

      {/* Featured article */}
      {featured && (
        <Link href={`/educacion/${featured.slug}`} className="no-underline block mb-5">
          <div className="bg-gradient-to-br from-primary-dark to-primary-mid rounded-2xl px-5 py-5 text-white relative overflow-hidden">
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/5" />
            <span className="text-[9px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Guia destacada
            </span>
            <h3 className="font-display font-black text-[17px] mt-2.5 mb-1">{featured.title}</h3>
            <p className="text-xs opacity-80">{featured.content[0]?.text.slice(0, 80)}...</p>
            <span className="inline-block mt-3 px-4 py-2 rounded-[10px] bg-white/20 border border-white/30 text-white font-bold text-xs">
              Leer articulo
            </span>
          </div>
        </Link>
      )}

      {/* Article list */}
      {articles.map((a, i) => {
        const IconComp = ICON_MAP[a.icon ?? "activity"] ?? Activity;
        return (
          <Link key={a.id} href={`/educacion/${a.slug}`} className="no-underline block mb-2">
            <div className="bg-card rounded-xl px-4 py-3.5 border border-border-l flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] ${BG_COLORS[i % 6]} flex items-center justify-center flex-shrink-0`}>
                <IconComp size={18} className="text-text" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-xs text-text">{a.title}</p>
                <div className="flex gap-1.5 mt-0.5">
                  <span className="text-[10px] text-primary font-semibold">{a.tag}</span>
                  <span className="text-[10px] text-muted">· {a.readingTime} min</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
