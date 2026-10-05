"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, type AddedInfo } from "./CartProvider";

type Props = { variantId: string; stock: number; info: Omit<AddedInfo, "quantita"> };

/** Quantità + "Aggiungi al carrello" per la variante scelta (limitato allo stock). */
export default function AddToCart({ variantId, stock, info }: Props) {
  const { lines, add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(0); // contatore: rilancia l'animazione a ogni clic

  const inCart = lines.find((l) => l.variantId === variantId)?.quantita ?? 0;
  const max = Math.max(0, stock - inCart);
  const q = Math.min(qty, Math.max(max, 1));

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-full bg-neutral-100 p-1">
          <button type="button" aria-label="Diminuisci quantità" onClick={() => setQty(Math.max(1, q - 1))} disabled={q <= 1}
            className="flex size-10 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-30">
            <Minus size={16} />
          </button>
          <span key={q} className="w-8 animate-pop text-center text-lg font-bold" aria-live="polite">{q}</span>
          <button type="button" aria-label="Aumenta quantità" onClick={() => setQty(Math.min(max, q + 1))} disabled={q >= max}
            className="flex size-10 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-30">
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          disabled={max === 0}
          onClick={() => {
            add(variantId, q, stock, { ...info, quantita: q });
            setAdded((n) => n + 1);
            setQty(1);
          }}
          className={cn(
            "relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-lg font-bold transition",
            "bg-navy text-white shadow-lg shadow-navy/20 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[.98]",
            "disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          )}
        >
          {added > 0 && <span key={added} aria-hidden className="absolute inset-0 animate-[fade-in_.6s_ease-out_reverse_both] bg-green-500" />}
          <span key={`i${added}`} className={cn("relative", added > 0 && "animate-pop")}>
            {added > 0 ? <Check size={22} /> : <ShoppingBag size={22} />}
          </span>
          <span className="relative">{max === 0 ? "Massimo nel carrello" : "Aggiungi al carrello"}</span>
        </button>
      </div>
      {inCart > 0 && (
        <p className="animate-fade-in text-sm text-neutral-600">
          Nel carrello: <strong>{inCart}</strong> {inCart === 1 ? "pezzo" : "pezzi"}
        </p>
      )}
    </div>
  );
}
