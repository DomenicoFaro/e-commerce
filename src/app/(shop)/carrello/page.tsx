import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { getSpedizione } from "@/lib/settings";

export const metadata: Metadata = { title: "Carrello", robots: { index: false } };

export default async function CartPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Il tuo carrello</h1>
      <CartView spedizione={await getSpedizione()} />
    </>
  );
}
