import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogLayout from "@/components/catalog/CatalogLayout";
import Filters from "@/components/catalog/Filters";
import PageHero from "@/components/catalog/PageHero";
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
  const base = `/c/${category.slug}`;

  return (
    <>
      <Breadcrumbs items={path.map((c) => ({ label: c.nome, href: c.id === category.id ? undefined : `/c/${c.slug}` }))} />
      <PageHero
        eyebrow={path.length > 1 ? path[0].nome : "Reparto"}
        title={category.nome}
        description="Spedizione in tutta Italia o ritiro gratuito in negozio a Giarre."
      >
        {children.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Sottocategorie">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className="block rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white hover:text-navy">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageHero>
      <CatalogLayout
        filters={<Filters facets={facets} params={filters} resetHref={base} />}
        totale={products.length} basePath={base} searchParams={searchParams} sort={filters.sort}
        labels={Object.fromEntries(facets.marche.map((m) => [m.slug, m.nome]))}
      >
        <ProductGrid products={products} />
      </CatalogLayout>
    </>
  );
}
