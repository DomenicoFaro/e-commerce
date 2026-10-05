"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/carrello" aria-label={`Carrello, ${count} articoli`}
      className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white/10">
      <span className="relative flex size-8 items-center justify-center rounded-full bg-sun text-navy">
        <ShoppingBag size={18} />
        {count > 0 && (
          <span key={count} className="absolute -right-1.5 -top-1.5 animate-bump flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-navy">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden font-semibold lg:inline">Carrello</span>
    </Link>
  );
}
