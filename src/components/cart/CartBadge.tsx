"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/carrello" aria-label={`Carrello, ${count} articoli`} className="relative flex items-center gap-1">
      <ShoppingCart size={22} />
      <span className="hidden font-semibold sm:inline">Carrello</span>
      {count > 0 && (
        <span className="absolute -left-2 -top-2 min-w-5 rounded-full bg-terracotta px-1.5 text-center text-xs font-bold">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
