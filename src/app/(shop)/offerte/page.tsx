import type { Metadata } from "next";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import ProductGrid from "@/components/catalog/ProductGrid";
import { listProducts } from "@/lib/catalog";
import { parseFilters, toListFilters, type SearchParams } from "@/lib/filters";

export const metadata: Metadata = { title: "Offerte", alternates: { canonical: "/offerte" } };

export default async function OffertePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(searchParams);
  const { products, facets } = await listProducts({ ...toListFilters(filters), soloOfferte: true });
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Offerte</h1>
      <CatalogLayout filters={<Filters facets={facets} params={filters} resetHref="/offerte" totale={products.length} />}>
        <ProductGrid products={products} />
      </CatalogLayout>
    </>
  );
}
