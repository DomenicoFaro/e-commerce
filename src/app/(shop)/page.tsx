import Link from "next/link";
import {
  ArrowRight, Bath, BedDouble, BadgeCheck, Clock, Flower2, MapPin, PencilRuler, ShieldCheck, Shirt, Sofa,
  SprayCan, Store, Truck, UtensilsCrossed, type LucideIcon,
} from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import ProductImage from "@/components/catalog/ProductImage";
import { buttonVariants } from "@/components/ui/button";
import { getBrands, getDepartments, getFeaturedProducts, listProducts } from "@/lib/catalog";
import { getHome, getNegozio } from "@/lib/settings";

export const revalidate = 60;

const ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "biancheria-letto": { icon: BedDouble, bg: "bg-rose-100 text-rose-700" },
  bagno: { icon: Bath, bg: "bg-sky-100 text-sky-700" },
  "cucina-e-tavola": { icon: UtensilsCrossed, bg: "bg-amber-100 text-amber-700" },
  "intimo-e-pigiami": { icon: Shirt, bg: "bg-violet-100 text-violet-700" },
  "casa-e-arredo-tessile": { icon: Sofa, bg: "bg-emerald-100 text-emerald-700" },
  "igiene-casa-e-persona": { icon: SprayCan, bg: "bg-teal-100 text-teal-700" },
  garden: { icon: Flower2, bg: "bg-lime-100 text-lime-700" },
  "cartoleria-scuola-party": { icon: PencilRuler, bg: "bg-orange-100 text-orange-700" },
};

const VANTAGGI = [
  { icon: Store, titolo: "Ritiro gratuito", testo: "In negozio a Giarre" },
  { icon: Truck, titolo: "Spedizione rapida", testo: "In tutta Italia" },
  { icon: BadgeCheck, titolo: "Marchi originali", testo: "Caleffi, Trussardi e altri" },
  { icon: ShieldCheck, titolo: "Pagamenti sicuri", testo: "Carte e wallet digitali" },
];

function SectionTitle({ id, title, href, link }: { id: string; title: string; href?: string; link?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all">
          {link} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [home, negozio, departments, featured, offerte, brands] = await Promise.all([
    getHome(), getNegozio(), getDepartments(), getFeaturedProducts(8),
    listProducts({ soloOfferte: true, disponibili: true }).then((r) => r.products.slice(0, 4)),
    getBrands(),
  ]);
  const collage = featured.slice(0, 4);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Shop House ${negozio.indirizzo}`)}`;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#26345a] to-[#3a2f4f] px-6 py-12 text-white md:px-12 md:py-16">
        <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-terracotta/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-sun/20 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sun">
              <MapPin size={14} /> Il tuo negozio di Giarre, ora online
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{home.titolo}</h1>
            <p className="mt-4 max-w-lg text-lg text-white/80">{home.sottotitolo}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={home.cta_link} className={buttonVariants({ size: "lg" })}>{home.cta_testo} <ArrowRight size={20} /></Link>
              <Link href="/s?sort=novita" className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/15" })}>
                Sfoglia il catalogo
              </Link>
            </div>
          </div>
          {collage.length > 0 && (
            <div className="hidden grid-cols-2 gap-4 md:grid">
              {collage.map((p, i) => (
                <Link key={p.id} href={`/p/${p.slug}`}
                  className={`group relative aspect-square overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 ${i % 2 ? "translate-y-6" : ""}`}>
                  <ProductImage src={p.immagine.url} alt={p.immagine.alt} fill sizes="25vw" priority={i < 2} className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-x-2 bottom-2 truncate rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-navy">{p.titolo}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Offerte */}
      {offerte.length > 0 && (
        <section aria-labelledby="offerte" className="rounded-3xl bg-terracotta/10 p-6 md:p-8">
          <SectionTitle id="offerte" title="Offerte del momento" href="/offerte" link="Tutte le offerte" />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {offerte.map((p, i) => <li key={p.id} className="flex"><ProductCard product={p} index={i} /></li>)}
          </ul>
        </section>
      )}

      {/* In evidenza */}
      {featured.length > 0 && (
        <section aria-labelledby="in-evidenza">
          <SectionTitle id="in-evidenza" title="In evidenza" href="/s?sort=novita" link="Vedi tutti" />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p, i) => <li key={p.id} className="flex"><ProductCard product={p} index={i} /></li>)}
          </ul>
        </section>
      )}

      {/* Vantaggi */}
      <section aria-label="Perché sceglierci" className="grid grid-cols-2 overflow-hidden rounded-3xl bg-navy text-white md:grid-cols-4">
        {VANTAGGI.map(({ icon: Icon, titolo, testo }, i) => (
          <div key={titolo} className={`flex flex-col items-center gap-3 p-6 text-center ${i > 0 ? "md:border-l md:border-white/10" : ""} ${i % 2 ? "border-l border-white/10 md:border-l" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""}`}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-sun"><Icon size={24} /></span>
            <span>
              <span className="block font-bold">{titolo}</span>
              <span className="text-sm text-white/60">{testo}</span>
            </span>
          </div>
        ))}
      </section>

      {/* Reparti */}
      <section aria-labelledby="reparti">
        <SectionTitle id="reparti" title="Acquista per reparto" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {departments.map((d) => {
            const { icon: Icon, bg } = ICONS[d.slug] ?? { icon: Store, bg: "bg-neutral-100 text-neutral-700" };
            return (
              <li key={d.id}>
                <Link href={`/c/${d.slug}`} className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${bg}`}><Icon size={24} aria-hidden /></span>
                  <span className="font-semibold leading-tight">{d.nome}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Marchi */}
      {brands.length > 0 && (
        <section aria-labelledby="marchi">
          <SectionTitle id="marchi" title="I nostri marchi" />
          <ul className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/marca/${b.slug}`} className="block rounded-full border border-neutral-200 bg-white px-5 py-2.5 font-semibold tracking-wide transition hover:border-navy hover:text-navy">
                  {b.nome}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Negozio */}
      <section className="grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
        <div className="space-y-4 p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Vieni a trovarci</h2>
          <p className="text-neutral-600">Ordina online e ritira gratis in negozio, oppure passa a scoprire tutte le novità.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><MapPin size={18} className="shrink-0 text-terracotta" />{negozio.indirizzo}</li>
            <li className="flex gap-2"><Clock size={18} className="shrink-0 text-terracotta" />{negozio.orari_testo}</li>
          </ul>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "dark" })}>
            Indicazioni stradali <ArrowRight size={18} />
          </a>
        </div>
        <div aria-hidden className="relative hidden min-h-56 bg-gradient-to-br from-sun/40 via-terracotta/30 to-navy/30 md:block">
          <Store size={120} className="absolute inset-0 m-auto text-white/80" />
        </div>
      </section>
    </div>
  );
}
