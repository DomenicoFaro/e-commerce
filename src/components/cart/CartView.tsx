"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Store, Trash2, Truck } from "lucide-react";
import ProductImage from "@/components/catalog/ProductImage";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Spedizione } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

type Detail = {
  id: string;
  prezzo: number;
  prezzo_barrato: number | null;
  stock: number;
  colore: string | null;
  misura: string | null;
  taglia: string | null;
  products: { titolo: string; slug: string; product_images: { url: string; alt: string; ordine: number }[] } | null;
};

export default function CartView({ spedizione }: { spedizione: Spedizione }) {
  const { lines, ready, setQuantity, remove } = useCart();
  const [details, setDetails] = useState<Map<string, Detail>>(new Map());
  const [loading, setLoading] = useState(true);
  const [metodo, setMetodo] = useState<"shipping" | "pickup">("shipping");

  const ids = lines.map((l) => l.variantId).sort().join(",");
  useEffect(() => {
    if (!ready) return;
    if (!ids) {
      setLoading(false);
      return;
    }
    fetch(`/api/carrello?ids=${ids}`)
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => [])
      .then((data: Detail[]) => {
        setDetails(new Map(data.map((d) => [d.id, d])));
        setLoading(false);
      });
  }, [ids, ready]);

  if (!ready || loading) return <p className="rounded-xl bg-white p-8 text-center text-neutral-500">Caricamento…</p>;

  // Righe di varianti non più in vendita vengono ignorate
  const rows = lines.flatMap((l) => {
    const d = details.get(l.variantId);
    return d?.products ? [{ ...l, d, p: d.products }] : [];
  });

  if (!rows.length) {
    return (
      <div className="rounded-xl bg-white p-10 text-center">
        <p className="mb-4 text-lg">Il carrello è vuoto.</p>
        <Link href="/" className={buttonVariants({ variant: "dark" })}>Continua lo shopping</Link>
      </div>
    );
  }

  const subtotale = rows.reduce((t, r) => t + r.d.prezzo * r.quantita, 0);
  const gratis = spedizione.soglia !== null && subtotale >= spedizione.soglia;
  const costoSped = metodo === "pickup" || gratis ? 0 : spedizione.costo;
  const problemi = rows.some((r) => r.quantita > r.d.stock);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-neutral-200 rounded-xl bg-white">
        {rows.map(({ variantId, quantita, d, p }) => {
          const img = [...p.product_images].sort((a, b) => a.ordine - b.ordine)[0];
          const opzioni = [d.colore, d.misura, d.taglia].filter(Boolean).join(" · ");
          return (
            <li key={variantId} className="flex gap-4 p-4">
              <Link href={`/p/${p.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <ProductImage src={img?.url ?? "/placeholder.svg"} alt={img?.alt || p.titolo} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/p/${p.slug}`} className="font-semibold hover:underline">{p.titolo}</Link>
                {opzioni && <p className="text-sm text-neutral-600">{opzioni}</p>}
                {d.stock === 0 ? (
                  <p className="text-sm font-semibold text-terracotta-dark">Esaurito: rimuovilo per procedere</p>
                ) : quantita > d.stock ? (
                  <p className="text-sm font-semibold text-terracotta-dark">Disponibili solo {d.stock} pezzi</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-full border border-neutral-300">
                    <button type="button" aria-label="Diminuisci" className="p-2 disabled:opacity-40" disabled={quantita <= 1}
                      onClick={() => setQuantity(variantId, quantita - 1)}><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-semibold">{quantita}</span>
                    <button type="button" aria-label="Aumenta" className="p-2 disabled:opacity-40" disabled={quantita >= d.stock}
                      onClick={() => setQuantity(variantId, quantita + 1)}><Plus size={14} /></button>
                  </div>
                  <span className="font-bold">{formatPrice(d.prezzo * quantita)}</span>
                  <button type="button" onClick={() => remove(variantId)} aria-label={`Rimuovi ${p.titolo}`}
                    className="rounded-full p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit space-y-4 rounded-xl bg-white p-5 lg:sticky lg:top-36">
        <fieldset className="space-y-2">
          <legend className="mb-2 font-semibold">Consegna</legend>
          {([
            ["shipping", Truck, "Spedizione a casa", "In tutta Italia"],
            ["pickup", Store, "Ritiro in negozio", "Gratis a Giarre"],
          ] as const).map(([value, Icon, label, sub]) => (
            <label key={value} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3", metodo === value ? "border-navy bg-navy/5" : "border-neutral-200")}>
              <input type="radio" name="metodo" value={value} checked={metodo === value} onChange={() => setMetodo(value)} className="accent-navy" />
              <Icon size={20} className="text-navy" />
              <span><span className="block text-sm font-semibold">{label}</span><span className="text-xs text-neutral-500">{sub}</span></span>
            </label>
          ))}
        </fieldset>
        <dl className="space-y-1 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotale</dt><dd>{formatPrice(subtotale)}</dd></div>
          <div className="flex justify-between">
            <dt>Spedizione</dt>
            <dd>{costoSped === 0 ? "Gratis" : costoSped === null ? "Calcolata al pagamento" : formatPrice(costoSped)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-lg font-bold">
            <dt>Totale</dt><dd>{formatPrice(subtotale + (costoSped ?? 0))}</dd>
          </div>
          <p className="text-xs text-neutral-500">IVA inclusa</p>
        </dl>
        {metodo === "shipping" && spedizione.soglia !== null && !gratis && (
          <p className="rounded-lg bg-sun/25 p-3 text-sm">
            Ti mancano <strong>{formatPrice(spedizione.soglia - subtotale)}</strong> per la spedizione gratuita.
          </p>
        )}
        {/* TODO Milestone 3: checkout Stripe */}
        <Button className="w-full" size="lg" disabled title="Il pagamento online sarà attivo a breve">
          Procedi al pagamento
        </Button>
        <p className="text-center text-xs text-neutral-500">
          {problemi ? "Correggi le quantità evidenziate per procedere." : "Il pagamento online sarà attivo a breve."}
        </p>
      </aside>
    </div>
  );
}
