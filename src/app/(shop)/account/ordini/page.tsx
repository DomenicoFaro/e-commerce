import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { STATI_ORDINE } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "I miei ordini", robots: { index: false } };

export default async function OrdersPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/account?next=/account/ordini");

  // La RLS restituisce solo gli ordini dell'utente collegato
  const { data: orders } = await createClient()
    .from("orders")
    .select("id, numero, stato, totale, metodo_consegna, created_at, order_items(titolo, quantita)")
    .eq("user_id", current.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">I miei ordini</h1>
      {!orders?.length ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <p className="mb-4">Non hai ancora effettuato ordini.</p>
          <Link href="/" className={buttonVariants({ variant: "dark" })}>Inizia lo shopping</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{o.numero}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(o.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                    {o.metodo_consegna === "pickup" ? "Ritiro in negozio" : "Spedizione"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATI_ORDINE[o.stato].classe}`}>{STATI_ORDINE[o.stato].label}</span>
                <span className="font-bold">{formatPrice(o.totale)}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{o.order_items.map((i) => `${i.quantita}× ${i.titolo}`).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
