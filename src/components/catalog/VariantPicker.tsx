"use client";

import { useMemo, useState } from "react";
import { Check, Store, Truck } from "lucide-react";
import type { Variant } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import AddToCart from "@/components/cart/AddToCart";
import Price from "./Price";
import ProductImage from "./ProductImage";

type Image = { id: string; url: string; alt: string; variant_id: string | null };
type Props = { titolo: string; variants: Variant[]; images: Image[] };

const DIMENSIONS = [
  { key: "colore", label: "Colore" },
  { key: "misura", label: "Misura" },
  { key: "taglia", label: "Taglia" },
] as const;
type Dim = (typeof DIMENSIONS)[number]["key"];
type Selection = Partial<Record<Dim, string>>;

const pick = (v: Variant): Selection =>
  Object.fromEntries(DIMENSIONS.flatMap(({ key }) => (v[key] ? [[key, v[key]]] : [])));

export default function VariantPicker({ titolo, variants, images }: Props) {
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

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
          <ProductImage src={main.url} alt={main.alt || titolo} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
        </div>
        {gallery.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto">
            {gallery.map((img, i) => (
              <li key={img.id}>
                <button type="button" onClick={() => setActive(i)} aria-label={`Immagine ${i + 1}`} aria-current={i === active}
                  className={cn("relative block size-16 overflow-hidden rounded border-2 bg-white", i === active ? "border-navy" : "border-transparent")}>
                  <ProductImage src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-5">
        <h1 className="text-2xl font-bold">{titolo}</h1>
        {variant && <Price prezzo={variant.prezzo} prezzoBarrato={variant.prezzo_barrato} className="text-2xl" />}
        <p className="text-xs text-neutral-500">IVA inclusa</p>

        {dims.map(({ key, label }) => {
          const values = Array.from(new Set(variants.map((v) => v[key]).filter((v): v is string => !!v)));
          return (
            <fieldset key={key}>
              <legend className="mb-2 text-sm">
                {label}: <span className="font-semibold">{sel[key]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const match = variants.find((v) => v[key] === value && dims.every((d) => d.key === key || v[d.key] === sel[d.key]));
                  const esaurito = match ? match.stock === 0 : !variants.some((v) => v[key] === value && v.stock > 0);
                  const selected = sel[key] === value;
                  return (
                    <button key={value} type="button" aria-pressed={selected} onClick={() => choose(key, value)}
                      className={cn(
                        "rounded border px-3 py-1.5 text-sm",
                        selected ? "border-navy bg-navy text-white" : "border-neutral-300 bg-white hover:border-navy",
                        esaurito && !selected && "text-neutral-400 line-through",
                      )}>
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <p className={cn("font-semibold", stock === 0 ? "text-terracotta" : "text-green-700")} role="status">
          {stock === 0 ? "Esaurito" : stock <= 3 ? `Disponibile — ultimi ${stock} pezzi` : "Disponibile"}
        </p>

        {variant && stock > 0 && <AddToCart key={variant.id} variantId={variant.id} stock={stock} />}

        <ul className="space-y-2 rounded-lg bg-white p-4 text-sm">
          <li className="flex gap-2"><Truck size={18} className="shrink-0 text-navy" /> Spedizione in tutta Italia</li>
          <li className="flex gap-2"><Store size={18} className="shrink-0 text-navy" /> Ritiro gratuito in negozio a Giarre</li>
          {variant && <li className="flex gap-2 text-neutral-500"><Check size={18} className="shrink-0" /> Codice: {variant.sku}</li>}
        </ul>
      </div>
    </div>
  );
}
