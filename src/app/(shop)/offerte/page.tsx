import type { Metadata } from "next";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import PageHero from "@/components/catalog/PageHero";
import ProductGrid from "@/components/catalog/ProductGrid";
import { listProducts } from "@/lib/catalog";
import { parseFilters, toListFilters, type SearchParams } from "@/lib/filters";

export const metadata: Metadata = { title: "Offerte", alternates: { canonical: "/offerte" } };

export default async function OffertePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(searchParams);
  const { products, facets } = await listProducts({ ...toListFilters(filters), soloOfferte: true });
  const maxSconto = Math.max(0, ...products.map((p) => (p.prezzoBarrato ? Math.round((1 - p.prezzoMin / p.prezzoBarrato) * 100) : 0)));
  return (
    <>
      <PageHero
        tone="terracotta"
        eyebrow="Prezzi speciali"
        title={maxSconto > 0 ? <>Offerte fino al <span className="text-navy">-{maxSconto}%</span></> : "Offerte"}
        description="I migliori marchi per la casa a prezzo ribassato, fino a esaurimento scorte."
      />
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} resetHref="/offerte" />}
        totale={products.length} basePath="/offerte" searchParams={searchParams} sort={filters.sort}
        labels={Object.fromEntries(facets.marche.map((m) => [m.slug, m.nome]))}
      >
        <ProductGrid products={products} empty={<p>Al momento non ci sono offerte attive. Torna presto!</p>} />
      </CatalogLayout>
    </>
  );
}
