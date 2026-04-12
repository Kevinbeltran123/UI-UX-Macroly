import { createClient } from "@/lib/supabase/server";
import { mapArticle, mapProduct } from "@/lib/supabase/mappers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { MacroChip } from "@/components/nutrition/macro-chip";

type Props = { params: Promise<{ slug: string }> };

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const article = mapArticle(data);

  const relatedProducts = article.relatedProductIds.length > 0
    ? await supabase
        .from("products")
        .select("*")
        .in("id", article.relatedProductIds)
        .limit(4)
        .then(({ data: p }) => (p ?? []).map(mapProduct))
    : [];

  const sectionColors = ["text-protein", "text-carbs", "text-fat"];
  const tipBgs = [
    "bg-protein-light border-l-4 border-protein",
    "bg-carbs-light border-l-4 border-carbs",
    "bg-fat-light border-l-4 border-fat",
  ];

  return (
    <div className="px-5 pb-6">
      <Link
        href="/educacion"
        className="flex items-center gap-1.5 text-sm text-primary font-semibold py-3.5 no-underline"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      <h2 className="font-display font-black text-xl text-text mb-1.5">{article.title}</h2>
      <div className="flex gap-2 mb-6">
        <span className="text-xs text-primary font-semibold">{article.tag}</span>
        <span className="text-xs text-muted">· {article.readingTime} min lectura</span>
      </div>

      {/* Article sections */}
      {article.content.map((section, i) => (
        <div key={i} className="mb-5">
          <h3 className={`font-display font-extrabold text-[15px] mb-2 ${sectionColors[i % 3]}`}>
            {section.title}
          </h3>
          <p className="text-[13px] text-sub leading-relaxed">{section.text}</p>
        </div>
      ))}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <>
          <h4 className="font-display font-extrabold text-sm text-text mt-6 mb-3">
            Productos relacionados
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {relatedProducts.slice(0, 2).map((p) => (
              <Link key={p.id} href={`/catalogo/${p.id}`} className="no-underline">
                <div className="bg-card rounded-xl p-2.5 border border-border-l">
                  <div className="h-[60px] rounded-lg bg-gradient-to-br from-primary-light to-primary-border mb-1.5" />
                  <p className="font-display font-bold text-[11px] text-text mb-0.5">{p.name}</p>
                  <div className="mb-1">
                    <MacroChip
                      type={p.protein > 20 ? "protein" : p.carbs > 50 ? "carbs" : "fat"}
                      value={p.protein > 20 ? p.protein : p.carbs > 50 ? p.carbs : p.fat}
                      compact
                    />
                  </div>
                  <p className="font-display font-extrabold text-xs text-text">${p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
