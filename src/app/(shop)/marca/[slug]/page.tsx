import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
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

  return (
    <>
      <Breadcrumbs items={[{ label: brand.nome }]} />
      <h1 className="text-2xl font-bold">{brand.nome}</h1>
      {brand.descrizione && <p className="mt-1 max-w-2xl text-neutral-700">{brand.descrizione}</p>}
      <div className="mt-4">
        <CatalogLayout
          filters={<Filters facets={facets} params={filters} showMarche={false} resetHref={`/marca/${brand.slug}`} totale={products.length} />}
        >
          <ProductGrid products={products} />
        </CatalogLayout>
      </div>
    </>
  );
}
