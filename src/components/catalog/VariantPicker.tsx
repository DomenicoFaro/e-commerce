"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, Store, Truck } from "lucide-react";
import AddToCart from "@/components/cart/AddToCart";
import type { Variant } from "@/lib/catalog";
import { swatch } from "@/lib/colors";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import ProductImage from "./ProductImage";

type Image = { id: string; url: string; alt: string; variant_id: string | null };
type Props = {
  titolo: string;
  marca: { nome: string; slug: string } | null;
  puntiChiave: string[];
  variants: Variant[];
  images: Image[];
};

const DIMENSIONS = [
  { key: "colore", label: "Colore" },
  { key: "misura", label: "Misura" },
  { key: "taglia", label: "Taglia" },
] as const;
type Dim = (typeof DIMENSIONS)[number]["key"];
type Selection = Partial<Record<Dim, string>>;

const pick = (v: Variant): Selection =>
  Object.fromEntries(DIMENSIONS.flatMap(({ key }) => (v[key] ? [[key, v[key]]] : [])));

export default function VariantPicker({ titolo, marca, puntiChiave, variants, images }: Props) {
  const dims = DIMENSIONS.filter(({ key }) => new Set(variants.map((v) => v[key]).filter(Boolean)).size > 1);
  const [sel, setSel] = useState<Selection>(() => pick(variants.find((v) => v.stock > 0) ?? variants[0]));

  const variant = useMemo(
    () => variants.find((v) => dims.every(({ key }) => v[key] === sel[key])) ?? null,
    [variants, dims, sel],
  );

  // Cambiando un valore, se la combinazione non esiste si passa alla prima variante che lo contiene
  function choose(key: Dim, value: string) {
    const next = { ...sel, [key]: value };
    const exact = variants.find((v) => dims.every((d) => v[d.key] === next[d.key]));
    const fallback = variants.filter((v) => v[key] === value).sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))[0];
    setSel(exact ? next : pick(fallback));
    setActive(0);
  }

  const gallery = useMemo(() => {
    const own = images.filter((i) => variant && i.variant_id === variant.id);
    const shared = images.filter((i) => !i.variant_id);
    const list = [...own, ...shared];
    return list.length ? list : [{ id: "placeholder", url: "/placeholder.svg", alt: titolo, variant_id: null }];
  }, [images, variant, titolo]);
  const [active, setActive] = useState(0);
  const main = gallery[Math.min(active, gallery.length - 1)];

  const stock = variant?.stock ?? 0;
  const risparmio = variant?.prezzo_barrato ? variant.prezzo_barrato - variant.prezzo : 0;
  const sconto = variant?.prezzo_barrato ? Math.round((risparmio / variant.prezzo_barrato) * 100) : 0;
  const opzioni = variant ? [variant.colore, variant.misura, variant.taglia].filter(Boolean).join(" · ") : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      {/* Galleria */}
      <div className="lg:sticky lg:top-36 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-sm">
          <div key={main.id} className="absolute inset-0 animate-scale-in">
            <ProductImage src={main.url} alt={main.alt || titolo} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-4" />
          </div>
          {sconto > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-terracotta-dark px-3 py-1 text-sm font-bold text-white shadow-lg">-{sconto}%</span>
          )}
        </div>
        {gallery.length > 1 && (
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {gallery.map((img, i) => (
              <li key={img.id}>
                <button type="button" onClick={() => setActive(i)} aria-label={`Immagine ${i + 1}`} aria-current={i === active}
                  className={cn("relative block size-20 overflow-hidden rounded-2xl bg-white ring-2 transition",
                    i === active ? "ring-navy" : "opacity-70 ring-transparent hover:opacity-100")}>
                  <ProductImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acquisto */}
      <div className="space-y-6">
        <div>
          {marca && (
            <Link href={`/marca/${marca.slug}`} className="text-sm font-semibold uppercase tracking-widest text-terracotta-dark hover:underline">
              {marca.nome}
            </Link>
          )}
          <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{titolo}</h1>
        </div>

        {variant && (
          <div key={variant.id} className="animate-fade-in">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight">{formatPrice(variant.prezzo)}</span>
              {variant.prezzo_barrato && (
                <s className="text-lg text-neutral-500"><span className="sr-only">Prezzo precedente </span>{formatPrice(variant.prezzo_barrato)}</s>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              IVA inclusa
              {risparmio > 0 && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800">Risparmi {formatPrice(risparmio)}</span>}
            </p>
          </div>
        )}

        {puntiChiave.length > 0 && (
          <ul className="space-y-1.5 text-neutral-700">
            {puntiChiave.slice(0, 4).map((k) => (
              <li key={k} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta-dark" />{k}</li>
            ))}
          </ul>
        )}

        {dims.map(({ key, label }) => {
          const values = Array.from(new Set(variants.map((v) => v[key]).filter((v): v is string => !!v)));
          return (
            <fieldset key={key}>
              <legend className="mb-2.5 text-sm text-neutral-600">
                {label}: <span className="font-semibold text-neutral-900">{sel[key]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const match = variants.find((v) => v[key] === value && dims.every((d) => d.key === key || v[d.key] === sel[d.key]));
                  const esaurito = match ? match.stock === 0 : !variants.some((v) => v[key] === value && v.stock > 0);
                  const selected = sel[key] === value;
                  const color = key === "colore" ? swatch(value) : undefined;
                  return (
                    <button key={value} type="button" aria-pressed={selected} onClick={() => choose(key, value)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition active:scale-95",
                        selected ? "border-navy bg-navy text-white shadow-md" : "border-neutral-200 bg-white hover:border-neutral-400",
                        esaurito && !selected && "text-neutral-400 line-through decoration-neutral-400",
                      )}>
                      {color && <span aria-hidden className="size-4 rounded-full ring-1 ring-black/15" style={{ background: color }} />}
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <p role="status" className={cn("flex items-center gap-2 text-sm font-semibold", stock === 0 ? "text-terracotta-dark" : stock <= 3 ? "text-amber-700" : "text-green-700")}>
            <span aria-hidden className={cn("relative flex size-2.5")}>
              {stock > 0 && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", stock <= 3 ? "bg-amber-500" : "bg-green-500")} />}
              <span className={cn("relative inline-flex size-2.5 rounded-full", stock === 0 ? "bg-terracotta-dark" : stock <= 3 ? "bg-amber-500" : "bg-green-500")} />
            </span>
            {stock === 0 ? "Esaurito" : stock <= 3 ? `Disponibile — solo ${stock} ${stock === 1 ? "pezzo" : "pezzi"}` : "Disponibile, pronto per la spedizione"}
          </p>
          {variant && stock > 0 ? (
            <AddToCart
              key={variant.id}
              variantId={variant.id}
              stock={stock}
              info={{ titolo, opzioni, immagine: gallery[0].url, prezzo: variant.prezzo }}
            />
          ) : (
            <p className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600">
              Questa variante è esaurita. Scegli un&apos;altra opzione o passa in negozio a chiedere.
            </p>
          )}
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, t: "Spedizione", s: "In tutta Italia" },
            { icon: Store, t: "Ritiro gratis", s: "In negozio a Giarre" },
            { icon: RotateCcw, t: "Reso facile", s: "Entro 14 giorni" },
          ].map(({ icon: Icon, t, s }) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm sm:flex-col sm:text-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sun/25 text-navy"><Icon size={20} /></span>
              <span><span className="block font-semibold">{t}</span><span className="text-xs text-neutral-500">{s}</span></span>
            </li>
          ))}
        </ul>
        {variant && <p className="text-xs text-neutral-400">Codice articolo: {variant.sku}</p>}
      </div>
    </div>
  );
}
