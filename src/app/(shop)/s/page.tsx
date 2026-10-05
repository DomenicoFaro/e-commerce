import type { Metadata } from "next";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getCategoryBySlug, listProducts, searchProductIds } from "@/lib/catalog";
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

  const [productIds, dept] = await Promise.all([
    q ? searchProductIds(q) : undefined,
    reparto ? getCategoryBySlug(reparto) : null,
  ]);
  const { products, facets } = await listProducts({ ...toListFilters(filters), productIds, categoryIds: dept?.ids });

  const hidden: Record<string, string> = {};
  if (q) hidden.q = q;
  if (dept) hidden.c = dept.category.slug;
  const resetHref = `/s?${new URLSearchParams(hidden)}`;

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">
        {q ? <>Risultati per “{q}”</> : "Tutti i prodotti"}
        {dept && <span className="font-normal text-neutral-600"> in {dept.category.nome}</span>}
      </h1>
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} hidden={hidden} showRilevanza={!!q} resetHref={resetHref} totale={products.length} />}
      >
        {q && products.length === 0 ? (
          <p className="rounded-lg bg-white p-8 text-center text-neutral-600">
            Nessun prodotto per “{q}”. Prova con un’altra parola o sfoglia le categorie.
          </p>
        ) : (
          <ProductGrid products={products} />
        )}
      </CatalogLayout>
    </>
  );
}
