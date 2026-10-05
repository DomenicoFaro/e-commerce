import type { Metadata } from "next";
import { Check, ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import VariantPicker from "@/components/catalog/VariantPicker";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getCategoryBySlug, getProductBySlug, listProducts } from "@/lib/catalog";

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

  // Correlati dallo stesso reparto (la sottocategoria spesso ha pochi prodotti)
  const reparto = cat && cat.path.length > 1 ? await getCategoryBySlug(cat.path[0].slug) : cat;
  const correlati = reparto
    ? (await listProducts({ categoryIds: reparto.ids, disponibili: true })).products.filter((x) => x.id !== p.id).slice(0, 4)
    : [];

  const dettagli = [
    { titolo: "Descrizione", testo: p.descrizione },
    { titolo: "Caratteristiche", lista: p.punti_chiave },
    { titolo: "Materiale", testo: p.materiale },
    { titolo: "Cura e lavaggio", testo: p.cura },
  ].filter((d) => d.testo || d.lista?.length);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[...(cat?.path ?? []).map((c) => ({ label: c.nome, href: `/c/${c.slug}` })), { label: p.titolo }]}
      />
      {p.product_variants.length > 0 ? (
        <VariantPicker titolo={p.titolo} marca={p.brands} puntiChiave={p.punti_chiave} variants={p.product_variants} images={p.product_images} />
      ) : (
        <h1 className="text-3xl font-extrabold">{p.titolo}</h1>
      )}

      {dettagli.length > 0 && (
        <section aria-labelledby="dettagli" className="mt-16 max-w-3xl">
          <h2 id="dettagli" className="mb-4 text-2xl font-extrabold tracking-tight">Dettagli del prodotto</h2>
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-3xl bg-white shadow-sm">
            {dettagli.map((d, i) => (
              <details key={d.titolo} open={i === 0} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-semibold transition hover:bg-neutral-50">
                  {d.titolo}
                  <ChevronDown size={20} className="text-neutral-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="animate-fade-in px-6 pb-6 leading-relaxed text-neutral-700">
                  {d.lista ? (
                    <ul className="space-y-2">{d.lista.map((k) => <li key={k} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-600" />{k}</li>)}</ul>
                  ) : (
                    <p className="whitespace-pre-line">{d.testo}</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {correlati.length > 0 && (
        <section aria-labelledby="correlati" className="mt-16">
          <h2 id="correlati" className="mb-5 text-2xl font-extrabold tracking-tight">Potrebbe piacerti anche</h2>
          <ProductGrid products={correlati} />
        </section>
      )}
    </>
  );
}
