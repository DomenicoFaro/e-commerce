import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import Price from "./Price";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded bg-neutral-100">
        <ProductImage
          src={product.immagine.url}
          alt={product.immagine.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          priority={priority}
          className="object-cover transition group-hover:scale-105"
        />
        {!product.disponibile && (
          <span className="absolute left-2 top-2 rounded bg-neutral-800 px-2 py-0.5 text-xs font-semibold text-white">
            Esaurito
          </span>
        )}
      </div>
      {product.marca && <span className="text-xs uppercase tracking-wide text-neutral-500">{product.marca.nome}</span>}
      <span className="line-clamp-2 font-medium group-hover:underline">{product.titolo}</span>
      <Price className="mt-auto pt-2" prezzo={product.prezzoMin} prezzoBarrato={product.prezzoBarrato} />
    </Link>
  );
}
