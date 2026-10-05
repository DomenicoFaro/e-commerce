import type { ProductCardData } from "@/lib/catalog";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return <p className="rounded-lg bg-white p-8 text-center text-neutral-600">Nessun prodotto trovato con questi filtri.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
