import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";

type Props = { product: ProductCardData; priority?: boolean; index?: number };

export default function ProductCard({ product, priority, index = 0 }: Props) {
  const sconto = product.prezzoBarrato ? Math.round((1 - product.prezzoMin / product.prezzoBarrato) * 100) : 0;
  return (
    <Link
      href={`/p/${product.slug}`}
      style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
      className="group flex w-full animate-card-in flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/[.03] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <ProductImage
          src={product.immagine.url}
          alt={product.immagine.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {sconto > 0 && <span className="rounded-full bg-terracotta-dark px-2.5 py-0.5 text-xs font-bold text-white shadow">-{sconto}%</span>}
          {!product.disponibile && <span className="rounded-full bg-neutral-900/80 px-2.5 py-0.5 text-xs font-semibold text-white">Esaurito</span>}
        </div>
        <span aria-hidden className="absolute bottom-3 right-3 flex size-10 translate-y-3 items-center justify-center rounded-full bg-white text-navy opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.marca && <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta-dark">{product.marca.nome}</span>}
        <span className="mt-0.5 line-clamp-2 font-semibold leading-snug">{product.titolo}</span>
        {product.colori.length > 1 && <span className="mt-1 text-xs text-neutral-500">{product.colori.length} colori</span>}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
          <span className="text-lg font-extrabold">
            {product.misure.length > 1 && <span className="text-xs font-normal text-neutral-500">da </span>}
            {formatPrice(product.prezzoMin)}
          </span>
          {product.prezzoBarrato && <s className="text-sm text-neutral-500">{formatPrice(product.prezzoBarrato)}</s>}
        </div>
      </div>
    </Link>
  );
}
