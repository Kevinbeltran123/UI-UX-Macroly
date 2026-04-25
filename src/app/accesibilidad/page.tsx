import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Accesibilidad — Macroly",
  description: "Declaración de accesibilidad de Macroly: nivel de conformidad, excepciones conocidas y canal para reportar barreras.",
};

export default function AccesibilidadPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mb-4 no-underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver
        </Link>

        <h1 className="font-display font-black text-2xl text-text mb-2">
          Declaración de accesibilidad
        </h1>
        <p className="text-sm text-sub mb-8 leading-relaxed">
          Macroly se diseña para ser usable por la mayor cantidad de personas posible, incluidas
          aquellas con discapacidades visuales, motoras, auditivas o cognitivas.
        </p>

        <section className="mb-7">
          <h2 className="font-display font-bold text-lg text-text mb-2">Nivel de conformidad</h2>
          <p className="text-sm text-sub leading-relaxed mb-2">
            Esta aplicación apunta a cumplir las pautas{" "}
            <strong className="text-text">WCAG 2.1 nivel AA</strong> de la W3C, con auditoría
            interna activa. Algunos criterios pueden estar parcialmente implementados; ver
            excepciones más abajo.
          </p>
          <p className="text-xs text-muted">Última revisión: 25 de abril de 2026</p>
        </section>

        <section className="mb-7">
          <h2 className="font-display font-bold text-lg text-text mb-2">Lo que ya está cubierto</h2>
          <ul className="text-sm text-sub leading-relaxed list-disc pl-5 space-y-1.5">
            <li>Tokens de color con contraste AA verificado (≥4.5:1 texto, ≥3:1 elementos no textuales)</li>
            <li>Tipografía mínima de 12px en toda la interfaz</li>
            <li>Zoom hasta 400% sin pérdida de funcionalidad</li>
            <li>Navegación completa por teclado con foco visible</li>
            <li>Encabezados (h1–h2) con jerarquía consistente</li>
            <li>Formularios con etiquetas asociadas, errores por campo y autocompletado semántico</li>
            <li>Modales con foco atrapado, tecla Escape y retorno de foco al cerrar</li>
            <li>Anuncios en vivo (aria-live) para cambios dinámicos: filtros, sliders, toasts</li>
            <li>Targets táctiles de al menos 44×44px en acciones primarias</li>
            <li>Soporte para <code className="text-xs bg-card px-1 rounded">prefers-reduced-motion</code></li>
            <li>Skip-link &ldquo;Saltar al contenido&rdquo; en cada layout</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="font-display font-bold text-lg text-text mb-2">Excepciones conocidas</h2>
          <div className="bg-card rounded-xl p-4 border border-border-l">
            <h3 className="font-bold text-sm text-text mb-1">Orientación vertical fija (WCAG 1.3.4)</h3>
            <p className="text-xs text-sub leading-relaxed">
              La aplicación está bloqueada en orientación vertical (portrait) por diseño:
              es una PWA pensada para uso de una mano en celular. La rotación a horizontal
              no aporta valor funcional y rompería la composición. Se documenta como decisión
              consciente, no omisión.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-text mb-2">Reporta una barrera</h2>
          <p className="text-sm text-sub leading-relaxed mb-3">
            Si encuentras un problema de accesibilidad, escríbenos a:
          </p>
          <a
            href="mailto:accesibilidad@macroly.app"
            className="inline-block px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm no-underline"
          >
            accesibilidad@macroly.app
          </a>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Nos comprometemos a responder en un plazo máximo de <strong>15 días hábiles</strong>
            con un análisis del problema y un plan de remediación.
          </p>
        </section>
      </div>
    </div>
  );
}
