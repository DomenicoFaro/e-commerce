import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getCategoryBySlug, listProducts } from "@/lib/catalog";
import { parseFilters, toListFilters, type SearchParams } from "@/lib/filters";

type Props = { params: { slug: string }; searchParams: SearchParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getCategoryBySlug(params.slug);
  if (!found) return {};
  return {
    title: found.category.nome,
    description: `${found.category.nome} dei migliori marchi da Shop House Giarre: spedizione in tutta Italia o ritiro gratuito in negozio.`,
    alternates: { canonical: `/c/${found.category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const found = await getCategoryBySlug(params.slug);
  if (!found) notFound();
  const { category, path, children, ids } = found;

  const filters = parseFilters(searchParams);
  const { products, facets } = await listProducts({ ...toListFilters(filters), categoryIds: ids });

  return (
    <>
      <Breadcrumbs items={path.map((c) => ({ label: c.nome, href: c.id === category.id ? undefined : `/c/${c.slug}` }))} />
      <h1 className="mb-4 text-2xl font-bold">{category.nome}</h1>
      {children.length > 0 && (
        <ul className="mb-6 flex flex-wrap gap-2" aria-label="Sottocategorie">
          {children.map((c) => (
            <li key={c.id}>
              <Link href={`/c/${c.slug}`} className="block rounded-full bg-white px-4 py-1.5 text-sm shadow-sm hover:bg-sun/40">
                {c.nome}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} resetHref={`/c/${category.slug}`} totale={products.length} />}
      >
        <ProductGrid products={products} />
      </CatalogLayout>
    </>
  );
}
