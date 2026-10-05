"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import ProductImage from "@/components/catalog/ProductImage";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { AddedInfo } from "./CartProvider";

/** Notifica "Aggiunto al carrello" che entra da destra e si chiude da sola. */
export default function CartToast({ info, count, onClose }: { info: AddedInfo; count: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div role="status" aria-live="polite"
      className="fixed right-4 top-4 z-[70] w-[min(24rem,calc(100vw-2rem))] animate-slide-in-right overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
      <div className="flex items-center justify-between bg-green-50 px-5 py-3">
        <p className="flex items-center gap-2 font-semibold text-green-800">
          <CheckCircle2 size={20} className="animate-pop" /> Aggiunto al carrello
        </p>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full p-1 text-green-800 hover:bg-green-100"><X size={18} /></button>
      </div>
      <div className="flex gap-4 p-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
          <ProductImage src={info.immagine} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold">{info.titolo}</p>
          {info.opzioni && <p className="text-sm text-neutral-500">{info.opzioni}</p>}
          <p className="mt-1 text-sm">{info.quantita} × <span className="font-bold">{formatPrice(info.prezzo)}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 pb-5">
        <button type="button" onClick={onClose} className={buttonVariants({ variant: "outline", size: "sm" })}>Continua</button>
        <Link href="/carrello" onClick={onClose} className={buttonVariants({ variant: "dark", size: "sm" })}>
          Carrello ({count})
        </Link>
      </div>
      <div aria-hidden className="h-1 origin-left bg-green-500 animate-shrink" />
    </div>
  );
}
