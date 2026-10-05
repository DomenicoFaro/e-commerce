import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import VariantPicker from "@/components/catalog/VariantPicker";
import { getCategoryBySlug, getProductBySlug } from "@/lib/catalog";

export const revalidate = 60;

// Nessuna pagina generata in build: ognuna viene creata alla prima visita e poi tenuta in cache
export const generateStaticParams = async () => [];

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  const description = p.seo_description ?? p.descrizione?.slice(0, 160) ?? undefined;
  const image = p.product_images[0]?.url;
  return {
    title: p.seo_title ?? p.titolo,
    description,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { title: p.titolo, description, images: image && !image.endsWith(".svg") ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  const cat = p.categories ? await getCategoryBySlug(p.categories.slug) : null;

  const prezzi = p.product_variants.map((v) => v.prezzo / 100);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.titolo,
    description: p.descrizione ?? undefined,
    sku: p.product_variants[0]?.sku,
    brand: p.brands ? { "@type": "Brand", name: p.brands.nome } : undefined,
    image: p.product_images.map((i) => i.url),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: Math.min(...prezzi),
      highPrice: Math.max(...prezzi),
      availability: p.product_variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[...(cat?.path ?? []).map((c) => ({ label: c.nome, href: `/c/${c.slug}` })), { label: p.titolo }]}
      />
      {p.brands && (
        <Link href={`/marca/${p.brands.slug}`} className="mb-1 inline-block text-sm text-navy hover:underline">
          {p.brands.nome}
        </Link>
      )}
      {p.product_variants.length > 0 ? (
        <VariantPicker titolo={p.titolo} variants={p.product_variants} images={p.product_images} />
      ) : (
        <h1 className="text-2xl font-bold">{p.titolo}</h1>
      )}

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          {p.punti_chiave.length > 0 && (
            <>
              <h2 className="mb-2 text-lg font-bold">In breve</h2>
              <ul className="list-disc space-y-1 pl-5">{p.punti_chiave.map((k) => <li key={k}>{k}</li>)}</ul>
            </>
          )}
          {p.descrizione && (
            <>
              <h2 className="mb-2 mt-6 text-lg font-bold">Descrizione</h2>
              <p className="whitespace-pre-line text-neutral-800">{p.descrizione}</p>
            </>
          )}
        </div>
        <dl className="h-fit space-y-3 rounded-lg bg-white p-4 text-sm">
          {p.materiale && (<div><dt className="font-semibold">Materiale</dt><dd>{p.materiale}</dd></div>)}
          {p.cura && (<div><dt className="font-semibold">Cura e lavaggio</dt><dd>{p.cura}</dd></div>)}
        </dl>
      </section>
    </>
  );
}
