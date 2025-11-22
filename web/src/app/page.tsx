import { CatalogExplorer } from "@/components/CatalogExplorer";
import { catalog } from "@/data/catalog";

export const metadata = {
  title: 'US Macro Data Catalog | High-Frequency Desk',
  description:
    'Curated catalog of free, public US macro and market data sources for a 2–4 week FX framework.',
};

export default function Home() {
  const totalSources = catalog.reduce(
    (count, category) =>
      count +
      category.indicators.reduce(
        (inner, indicator) => inner + indicator.sources.length,
        0,
      ),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-950 pb-16">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-16 pt-24 text-white lg:px-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
            High-Frequency Macro Desk · United States Focus
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Free US Macro & Market Data Catalog
          </h1>
          <p className="max-w-3xl text-base text-slate-200 sm:text-lg">
            Built for FX, indices, and gold positioning horizons of two to four weeks.
            Explore {totalSources}+ curated data feeds across policy, profits, liquidity,
            growth, markets, employment, credit, and inflation—only trusted public sources.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Ready for automation
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              API & CSV heavy bias
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Public & no paywalls
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-12">
        <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-12">
          <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur">
            <CatalogExplorer />
          </div>
        </div>
      </div>
    </main>
  );
}
