"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useArticlesReadStore } from "@/stores/articles-read-store";
import type { Article } from "@/domain/education/article";

/* Tag → editorial color (left accent stripe + tag label tint). Coherent, not random. */
const TAG_COLOR: Record<string, { stripe: string; text: string }> = {
  Basico:    { stripe: "var(--color-primary)", text: "text-primary" },
  Fitness:   { stripe: "var(--color-protein)", text: "text-protein" },
  Nutricion: { stripe: "var(--color-cal)",     text: "text-cal"     },
  Salud:     { stripe: "var(--color-fat)",     text: "text-fat"     },
  Tips:      { stripe: "var(--color-carbs)",   text: "text-carbs"   },
};
const FALLBACK_TAG = { stripe: "var(--color-primary)", text: "text-primary" };

const FILTER_CHIPS = [
  { value: "all",       label: "Todo"      },
  { value: "Basico",    label: "Básico"    },
  { value: "Fitness",   label: "Fitness"   },
  { value: "Nutricion", label: "Nutrición" },
  { value: "Salud",     label: "Salud"     },
  { value: "Tips",      label: "Tips"      },
] as const;

type FilterValue = (typeof FILTER_CHIPS)[number]["value"];

/* Curated horizontal collections. */
const COLLECTIONS: { id: string; label: string; intro: string; tag: string }[] = [
  { id: "start",   label: "Para empezar",        intro: "Lo esencial para tu primer paso", tag: "Basico"    },
  { id: "fitness", label: "Si entrenas",          intro: "Optimiza tu nutrición deportiva", tag: "Fitness"   },
  { id: "smart",   label: "Comer mejor con poco", intro: "Saludable sin gastar de más",     tag: "Nutricion" },
  { id: "health",  label: "Para tu salud",        intro: "Cuida condiciones específicas",   tag: "Salud"     },
  { id: "tips",    label: "Tips prácticos",       intro: "Aplícalos hoy mismo",             tag: "Tips"      },
];

/* Placeholder titles per tag — give a sense of upcoming content per category. */
const PLACEHOLDER_TITLES: Record<string, string[]> = {
  Basico:    ["Vitaminas y minerales clave", "Hidratación y electrolitos"],
  Fitness:   ["Carga de carbos pre-entreno", "Proteína y recuperación muscular"],
  Nutricion: ["Etiquetas: azúcares ocultos", "Comer fuera sin descontrol"],
  Salud:     ["Dieta y colesterol", "Diabetes: guía de carbos"],
  Tips:      ["Lista de mercado inteligente", "Snacks de menos de 200 kcal"],
};

type Props = { articles: Article[] };

export const EducacionClient = ({ articles }: Props) => {
  const [filter, setFilter] = useState<FilterValue>("all");
  const readSlugs = useArticlesReadStore((s) => s.readSlugs);

  const featured = articles[0];
  const collectibleArticles = useMemo(
    () => articles.filter((a) => a.slug !== featured?.slug),
    [articles, featured]
  );

  const totalCount = articles.length;
  const readCount = useMemo(
    () => articles.filter((a) => readSlugs.includes(a.slug)).length,
    [articles, readSlugs]
  );
  const progressPct = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const collections = useMemo(
    () =>
      COLLECTIONS.map((col) => ({
        ...col,
        items: collectibleArticles.filter((a) => a.tag === col.tag),
      })).filter((col) => col.items.length > 0),
    [collectibleArticles]
  );

  const filteredArticles = useMemo(
    () => (filter === "all" ? [] : articles.filter((a) => a.tag === filter)),
    [filter, articles]
  );

  return (
    <div className="px-5 pt-4 pb-4 animate-[fadeUp_0.3s_ease]">
      {/* Header with progress */}
      <h1 className="font-display font-extrabold text-xl text-text tracking-tight mb-3">
        Educación
      </h1>
      <div className="mb-5" aria-label="Progreso de lectura">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-sub">
            {readCount === 0
              ? `Empieza tu camino · ${totalCount} guías`
              : readCount === totalCount
              ? "¡Has leído todas las guías!"
              : `Has leído ${readCount} de ${totalCount} guías`}
          </span>
          {/* key={progressPct} → springPop fires when reading progress increments */}
          <span
            key={progressPct}
            className="text-xs text-primary font-bold tabular-nums inline-block animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            {progressPct}%
          </span>
        </div>
        <div className="h-1.5 bg-border-l rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filter chips — sticky with frosted glass */}
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="sticky top-[env(safe-area-inset-top,0px)] z-30 flex gap-2 overflow-x-auto scrollbar-hide pt-2 pb-3 mb-3 -mx-5 px-5 bg-bg/90 backdrop-blur-md shadow-[0_6px_16px_-8px_rgba(26,26,24,0.12)]"
      >
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              role="radio"
              aria-checked={active}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 active:scale-95 min-h-9",
                active
                  ? "bg-primary text-white shadow-card"
                  : "bg-card border border-border-l text-sub active:bg-border-l"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Featured hero */}
      {filter === "all" && featured && (
        <Link
          href={`/educacion/${featured.slug}`}
          className="no-underline block mb-6"
          aria-label={`Leer guía destacada: ${featured.title}`}
        >
          <div
            className="rounded-xl px-5 py-5 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1B3D2A 0%, #2D6A4F 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 90% 10%, rgba(82,183,136,0.4) 0%, transparent 60%)" }}
              aria-hidden="true"
            />
            <div className="relative">
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
                Guía destacada
              </span>
              <h2 className="font-display font-extrabold text-[18px] leading-snug mt-3 mb-1.5">
                {featured.title}
              </h2>
              <p className="text-xs opacity-75 leading-relaxed">
                {featured.content[0]?.text.slice(0, 80)}…
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-white/15 border border-white/25 text-white font-semibold text-xs">
                {readSlugs.includes(featured.slug) ? "Releer guía →" : "Empezar a leer →"}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Collections — horizontal rows when filter is "all" */}
      {filter === "all" &&
        collections.map((col) => {
          const phTitles = PLACEHOLDER_TITLES[col.tag] ?? [];
          /* Always pad rows to feel populated — at least 2 placeholders per row. */
          const placeholderCount = Math.max(2, 4 - col.items.length);
          return (
            <section key={col.id} className="mb-6">
              <div className="flex items-baseline justify-between mb-2.5">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-base text-text leading-tight">{col.label}</h2>
                  <p className="text-xs text-muted mt-0.5">{col.intro}</p>
                </div>
                <span className="text-xs text-muted shrink-0 ml-2 tabular-nums">
                  {col.items.length} guía{col.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
                {col.items.map((a) => (
                  <ArticleCard key={a.id} article={a} read={readSlugs.includes(a.slug)} />
                ))}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                  <PlaceholderCard
                    key={`ph-${col.id}-${i}`}
                    tag={col.tag}
                    title={phTitles[i % Math.max(phTitles.length, 1)] ?? "Próximamente"}
                  />
                ))}
              </div>
            </section>
          );
        })}

      {/* Filtered list — vertical when a specific category is selected */}
      {filter !== "all" && (
        <div className="flex flex-col gap-2">
          {filteredArticles.length === 0 ? (
            <p className="text-sm text-sub text-center py-10">
              Aún no hay guías en esta categoría.
            </p>
          ) : (
            filteredArticles.map((a) => (
              <ArticleListItem key={a.id} article={a} read={readSlugs.includes(a.slug)} />
            ))
          )}
          {/* Vertical placeholders to suggest upcoming content per filter */}
          {(PLACEHOLDER_TITLES[filter] ?? []).map((title, i) => (
            <PlaceholderListItem key={`vph-${i}`} tag={filter} title={title} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────── Sub-components ──────────────── */

const ArticleCard = ({ article, read }: { article: Article; read: boolean }) => {
  const color = TAG_COLOR[article.tag ?? ""] ?? FALLBACK_TAG;
  return (
    <Link
      href={`/educacion/${article.slug}`}
      className="no-underline block w-42.5 shrink-0"
      aria-label={`Leer guía: ${article.title}${read ? ", leída" : ""}`}
    >
      <div
        className="bg-card rounded-xl border border-border-l h-40 relative overflow-hidden flex flex-col transition-all duration-150 hover:shadow-card active:bg-border-l active:scale-[0.98]"
      >
        {/* Left editorial accent stripe */}
        <span
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: color.stripe }}
          aria-hidden="true"
        />
        <div className="flex flex-col h-full pl-4 pr-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-xs font-bold uppercase tracking-widest truncate", color.text)}>
              {article.tag}
            </span>
            {read && (
              <span
                className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0 ml-1.5 animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
                aria-label="Leído"
                title="Leído"
              >
                <Check size={9} strokeWidth={3.5} />
              </span>
            )}
          </div>
          <p className="font-display font-bold text-[13px] text-text leading-snug line-clamp-3 grow">
            {article.title}
          </p>
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-border-l">
            <span className="text-xs text-sub font-semibold">Leer →</span>
            <span className="text-xs text-muted tabular-nums">{article.readingTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const PlaceholderCard = ({ tag, title }: { tag: string; title: string }) => {
  const color = TAG_COLOR[tag] ?? FALLBACK_TAG;
  return (
    <div
      className="w-42.5 h-40 shrink-0 rounded-xl border border-dashed border-border bg-bg/50 relative overflow-hidden flex flex-col"
      aria-label="Guía próximamente"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1 opacity-30"
        style={{ background: color.stripe }}
        aria-hidden="true"
      />
      <div className="flex flex-col h-full pl-4 pr-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-xs font-bold uppercase tracking-widest opacity-50", color.text)}>
            {tag}
          </span>
          <span className="text-xs text-muted font-semibold uppercase tracking-wider">
            Pronto
          </span>
        </div>
        <p className="font-display font-bold text-[13px] text-muted leading-snug line-clamp-3 grow">
          {title}
        </p>
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-dashed border-border">
          <span className="text-xs text-muted">En camino</span>
          <span className="text-xs text-muted">— min</span>
        </div>
      </div>
    </div>
  );
};

const ArticleListItem = ({ article, read }: { article: Article; read: boolean }) => {
  const color = TAG_COLOR[article.tag ?? ""] ?? FALLBACK_TAG;
  return (
    <Link
      href={`/educacion/${article.slug}`}
      className="no-underline block"
      aria-label={`Leer guía: ${article.title}${read ? ", leída" : ""}`}
    >
      <div className="bg-card rounded-xl border border-border-l flex items-stretch transition-all duration-150 hover:shadow-card active:bg-border-l active:scale-[0.98] overflow-hidden">
        <span
          className="w-1 shrink-0"
          style={{ background: color.stripe }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 px-4 py-3.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[13px] text-text leading-snug">
              {article.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("text-xs font-bold uppercase tracking-wider", color.text)}>
                {article.tag}
              </span>
              <span className="text-xs text-muted">· {article.readingTime} min lectura</span>
            </div>
          </div>
          {read ? (
            <span
              className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 animate-[springPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
              aria-label="Leído"
              title="Leído"
            >
              <Check size={12} strokeWidth={3} />
            </span>
          ) : (
            <ChevronRight size={14} className="text-muted shrink-0" aria-hidden="true" />
          )}
        </div>
      </div>
    </Link>
  );
};

const PlaceholderListItem = ({ tag, title }: { tag: string; title: string }) => {
  const color = TAG_COLOR[tag] ?? FALLBACK_TAG;
  return (
    <div
      className="bg-bg/50 rounded-xl border border-dashed border-border flex items-stretch overflow-hidden"
      aria-label="Guía próximamente"
    >
      <span
        className="w-1 shrink-0 opacity-30"
        style={{ background: color.stripe }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 px-4 py-3.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[13px] text-muted leading-snug">{title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn("text-xs font-bold uppercase tracking-wider opacity-50", color.text)}>
              {tag}
            </span>
            <span className="text-xs text-muted">· Próximamente</span>
          </div>
        </div>
        <span className="text-xs text-muted font-bold uppercase tracking-widest shrink-0">
          Pronto
        </span>
      </div>
    </div>
  );
};
