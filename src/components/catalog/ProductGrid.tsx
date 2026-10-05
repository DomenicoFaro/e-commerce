import { SearchX } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, empty }: { products: ProductCardData[]; empty?: React.ReactNode }) {
  if (!products.length) {
    return (
      <div className="flex animate-fade-in flex-col items-center gap-3 rounded-3xl bg-white p-12 text-center text-neutral-600">
        <SearchX size={40} className="text-neutral-300" />
        {empty ?? <p>Nessun prodotto trovato con questi filtri.</p>}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < 4} index={i} />
        </li>
      ))}
    </ul>
  );
}
