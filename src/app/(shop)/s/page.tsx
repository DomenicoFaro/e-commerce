import type { Metadata } from "next";
import Link from "next/link";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import PageHero from "@/components/catalog/PageHero";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getCategoryBySlug, getDepartments, listProducts, searchProductIds } from "@/lib/catalog";
import { firstParam, parseFilters, toListFilters, type SearchParams } from "@/lib/filters";

type Props = { searchParams: SearchParams };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = firstParam(searchParams.q)?.trim();
  return { title: q ? `Risultati per “${q}”` : "Tutti i prodotti", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = firstParam(searchParams.q)?.trim() ?? "";
  const reparto = firstParam(searchParams.c) ?? "";
  const filters = parseFilters(searchParams);

  const [productIds, dept, departments] = await Promise.all([
    q ? searchProductIds(q) : undefined,
    reparto ? getCategoryBySlug(reparto) : null,
    getDepartments(),
  ]);
  const { products, facets } = await listProducts({ ...toListFilters(filters), productIds, categoryIds: dept?.ids });

  const hidden: Record<string, string> = {};
  if (q) hidden.q = q;
  if (dept) hidden.c = dept.category.slug;
  const resetHref = `/s?${new URLSearchParams(hidden)}`;

  return (
    <>
      <PageHero
        eyebrow={q ? "Risultati di ricerca" : "Catalogo"}
        title={q ? <>“{q}”</> : filters.sort === "novita" ? "Nuovi arrivi" : "Tutti i prodotti"}
        description={dept ? `Nel reparto ${dept.category.nome}` : undefined}
      />
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} hidden={hidden} resetHref={resetHref} />}
        totale={products.length} basePath="/s" searchParams={searchParams} sort={filters.sort} showRilevanza={!!q}
        labels={Object.fromEntries(facets.marche.map((m) => [m.slug, m.nome]))}
      >
        <ProductGrid
          products={products}
          empty={
            <>
              <p className="text-lg font-semibold text-neutral-800">Nessun prodotto per “{q}”</p>
              <p>Prova con un&apos;altra parola o sfoglia i reparti:</p>
              <ul className="mt-2 flex flex-wrap justify-center gap-2">
                {departments.map((d) => (
                  <li key={d.id}><Link href={`/c/${d.slug}`} className="block rounded-full bg-neutral-100 px-3 py-1.5 text-sm hover:bg-navy hover:text-white">{d.nome}</Link></li>
                ))}
              </ul>
            </>
          }
        />
      </CatalogLayout>
    </>
  );
}
