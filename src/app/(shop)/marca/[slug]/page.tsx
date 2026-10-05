import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import PageHero from "@/components/catalog/PageHero";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getBrandBySlug, listProducts } from "@/lib/catalog";
import { parseFilters, toListFilters, type SearchParams } from "@/lib/filters";

type Props = { params: { slug: string }; searchParams: SearchParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return {};
  return {
    title: brand.nome,
    description: brand.descrizione ?? `Prodotti ${brand.nome} da Shop House Giarre.`,
    alternates: { canonical: `/marca/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) notFound();

  const filters = parseFilters(searchParams);
  const { products, facets } = await listProducts({ ...toListFilters(filters), brandSlug: brand.slug });
  const base = `/marca/${brand.slug}`;

  return (
    <>
      <Breadcrumbs items={[{ label: brand.nome }]} />
      <PageHero tone="light" eyebrow="Marca" title={brand.nome} description={brand.descrizione ?? `Tutti i prodotti ${brand.nome} disponibili da Shop House Giarre.`} />
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} showMarche={false} resetHref={base} />}
        totale={products.length} basePath={base} searchParams={searchParams} sort={filters.sort}
      >
        <ProductGrid products={products} />
      </CatalogLayout>
    </>
  );
}
