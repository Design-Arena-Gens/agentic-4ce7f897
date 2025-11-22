'use client';

import { useMemo, useState } from 'react';
import type { CatalogCategory, DataSource, Indicator } from '@/data/catalog';
import { catalog } from '@/data/catalog';

type CatalogExplorerProps = {
  initialCatalog?: CatalogCategory[];
};

type FlattenedSource = DataSource & {
  indicator: Indicator;
  categoryId: string;
  categoryTitle: string;
};

const SOURCE_CARD_FIELDS: Array<
  keyof Pick<DataSource, 'coverage' | 'frequency' | 'typicalLag' | 'formats'>
> = ['coverage', 'frequency', 'typicalLag', 'formats'];

const uniqueTags = Array.from(
  new Set(
    catalog.flatMap((category) =>
      category.indicators.flatMap((indicator) =>
        indicator.sources.flatMap((source) => source.tags ?? []),
      ),
    ),
  ),
).sort();

export function CatalogExplorer({
  initialCatalog = catalog,
}: CatalogExplorerProps) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialCatalog
      .map((category) => {
        const indicators = category.indicators
          .map((indicator) => {
            const sources = indicator.sources.filter((source) => {
              const tagMatch = activeTag ? source.tags?.includes(activeTag) : true;

              if (!tagMatch) {
                return false;
              }

              if (!query) {
                return true;
              }

              const haystack = [
                source.name,
                source.provider,
                source.description,
                source.coverage,
                source.frequency,
                source.notes ?? '',
                indicator.title,
                indicator.summary,
              ]
                .join(' ')
                .toLowerCase();

              return haystack.includes(query);
            });

            return { ...indicator, sources };
          })
          .filter((indicator) => indicator.sources.length > 0);

        return { ...category, indicators };
      })
      .filter((category) => category.indicators.length > 0);
  }, [initialCatalog, search, activeTag]);

  const flattenedSources: FlattenedSource[] = useMemo(() => {
    return initialCatalog.flatMap((category) =>
      category.indicators.flatMap((indicator) =>
        indicator.sources.map((source) => ({
          ...source,
          indicator,
          categoryId: category.id,
          categoryTitle: category.title,
        })),
      ),
    );
  }, [initialCatalog]);

  const matchingSourcesCount = useMemo(() => {
    if (!search && !activeTag) {
      return flattenedSources.length;
    }

    const query = search.trim().toLowerCase();

    return flattenedSources.filter((source) => {
      const tagMatch = activeTag ? source.tags?.includes(activeTag) : true;

      if (!tagMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        source.name,
        source.provider,
        source.description,
        source.coverage,
        source.frequency,
        source.notes ?? '',
        source.indicator.title,
        source.indicator.summary,
        source.categoryTitle,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    }).length;
  }, [flattenedSources, search, activeTag]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Search the catalog
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. SOFR, breakeven, GDPNow, stablecoin"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Showing {matchingSourcesCount} data source
            {matchingSourcesCount === 1 ? '' : 's'} matching your filters.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-700">
              Quick tag filter
            </h3>
            {activeTag && (
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className="text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {uniqueTags.map((tag) => {
              const isActive = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(isActive ? null : tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {uniqueTags.length === 0 && (
              <p className="text-xs text-slate-500">No tags available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {filteredCatalog.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                  {category.title.charAt(0)}
                </span>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {category.title}
                </h2>
              </div>
              <p className="max-w-3xl text-sm text-slate-600">
                {category.description}
              </p>
            </div>

            <div className="space-y-6">
              {category.indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {indicator.title}
                      </h3>
                      <p className="max-w-3xl text-sm text-slate-600">
                        {indicator.summary}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {indicator.sources.length} source
                      {indicator.sources.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {indicator.sources.map((source) => (
                      <article
                        key={source.id}
                        className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <header className="space-y-1">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {source.name}
                          </h4>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {source.provider}
                          </p>
                        </header>
                        <p className="text-sm text-slate-600">
                          {source.description}
                        </p>
                        <dl className="grid flex-1 grid-cols-2 gap-3 text-xs text-slate-600">
                          {SOURCE_CARD_FIELDS.map((field) => (
                            <div key={field} className="space-y-1 rounded-lg bg-white p-3">
                              <dt className="font-semibold text-slate-500">
                                {formatLabel(field)}
                              </dt>
                              <dd className="text-slate-700">
                                {source[field] || '—'}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Access
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {source.access.map((endpoint) => (
                              <a
                                key={endpoint.url}
                                href={endpoint.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 transition hover:border-sky-400 hover:text-sky-800"
                              >
                                <span className="inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                                  {endpoint.type}
                                </span>
                                {endpoint.label ?? formatLinkLabel(endpoint.url)}
                              </a>
                            ))}
                          </div>
                          {source.notes && (
                            <p className="text-xs text-slate-500">{source.notes}</p>
                          )}
                          {source.tags && source.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {source.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filteredCatalog.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-800">
              No matches found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your search or clearing the tag filter to see more sources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLabel(field: keyof DataSource) {
  switch (field) {
    case 'coverage':
      return 'Coverage';
    case 'frequency':
      return 'Update Frequency';
    case 'typicalLag':
      return 'Typical Lag';
    case 'formats':
      return 'Formats';
    default:
      return field;
  }
}

function formatLinkLabel(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
