"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";

/** Quantità + "Aggiungi al carrello" per la variante scelta (limitato allo stock). */
export default function AddToCart({ variantId, stock }: { variantId: string; stock: number }) {
  const { lines, add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = lines.find((l) => l.variantId === variantId)?.quantita ?? 0;
  const max = Math.max(0, stock - inCart);
  const q = Math.min(qty, Math.max(max, 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-neutral-300 bg-white">
          <button type="button" aria-label="Diminuisci quantità" onClick={() => setQty(Math.max(1, q - 1))} className="p-2.5 disabled:opacity-40" disabled={q <= 1}>
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{q}</span>
          <button type="button" aria-label="Aumenta quantità" onClick={() => setQty(Math.min(max, q + 1))} className="p-2.5 disabled:opacity-40" disabled={q >= max}>
            <Plus size={16} />
          </button>
        </div>
        <Button
          className="flex-1"
          size="lg"
          disabled={max === 0}
          onClick={() => {
            add(variantId, q, stock);
            setAdded(true);
            setQty(1);
            setTimeout(() => setAdded(false), 2500);
          }}
        >
          {added ? <Check size={20} /> : <ShoppingCart size={20} />}
          {added ? "Aggiunto!" : "Aggiungi al carrello"}
        </Button>
      </div>
      {inCart > 0 && (
        <p className="text-sm text-neutral-600">
          Nel carrello: {inCart} {max === 0 && "(massimo disponibile)"} ·{" "}
          <Link href="/carrello" className="font-semibold text-navy underline">Vai al carrello</Link>
        </p>
      )}
    </div>
  );
}
