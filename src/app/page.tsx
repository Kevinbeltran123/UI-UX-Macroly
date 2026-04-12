export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-4xl font-black text-primary-dark">
        Macro<span className="text-primary-mid">ly</span>
      </h1>
      <p className="text-sub">Nutricion inteligente · Setup completo</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <span className="px-4 py-2 rounded-full bg-protein-light text-protein font-semibold text-sm">
          Proteina
        </span>
        <span className="px-4 py-2 rounded-full bg-carbs-light text-carbs font-semibold text-sm">
          Carbos
        </span>
        <span className="px-4 py-2 rounded-full bg-fat-light text-fat font-semibold text-sm">
          Grasas
        </span>
      </div>
      <p className="text-muted text-xs mt-4">Proximo: auth + onboarding (A1)</p>
    </main>
  );
}
