import Link from "next/link";
import { AlertTriangle, Package, Receipt, Star } from "lucide-react";
import { Badge, Card, PageHeader, Table, Td } from "@/components/admin/ui";
import { requireStaff } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { STATI_ORDINE } from "@/lib/orders";

export default async function AdminDashboard() {
  const { supabase } = await requireStaff();
  const [daEvadere, prodotti, esauriti, recensioni, ultimi] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).in("stato", ["paid", "processing"]),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("product_variants").select("id, sku, stock, products(id, titolo)").lte("stock", 2).order("stock").limit(10),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approvata", false),
    supabase.from("orders").select("id, numero, email, stato, totale, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const tiles = [
    { label: "Ordini da evadere", value: daEvadere.count ?? 0, icon: Receipt, href: "/admin/ordini?stato=paid" },
    { label: "Prodotti", value: prodotti.count ?? 0, icon: Package, href: "/admin/prodotti" },
    { label: "Varianti quasi esaurite", value: esauriti.data?.length ?? 0, icon: AlertTriangle, href: "#scorte" },
    { label: "Recensioni da approvare", value: recensioni.count ?? 0, icon: Star, href: "/admin/recensioni" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
            <Icon className="mb-3 text-terracotta" />
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-sm text-neutral-600">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Ultimi ordini</h2>
          {ultimi.data?.length ? (
            <Table head={["Numero", "Cliente", "Stato", "Totale"]}>
              {ultimi.data.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <Td><Link href={`/admin/ordini/${o.id}`} className="font-semibold text-navy hover:underline">{o.numero}</Link></Td>
                  <Td className="max-w-40 truncate">{o.email}</Td>
                  <Td><Badge className={STATI_ORDINE[o.stato].classe}>{STATI_ORDINE[o.stato].label}</Badge></Td>
                  <Td>{formatPrice(o.totale)}</Td>
                </tr>
              ))}
            </Table>
          ) : (
            <Card className="text-neutral-600">Nessun ordine per ora.</Card>
          )}
        </section>
        <section id="scorte">
          <h2 className="mb-3 text-lg font-bold">Scorte basse (≤ 2 pezzi)</h2>
          {esauriti.data?.length ? (
            <Table head={["Prodotto", "SKU", "Pezzi"]}>
              {esauriti.data.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50">
                  <Td><Link href={`/admin/prodotti/${v.products?.id}`} className="text-navy hover:underline">{v.products?.titolo}</Link></Td>
                  <Td className="font-mono text-xs">{v.sku}</Td>
                  <Td><Badge className={v.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{v.stock}</Badge></Td>
                </tr>
              ))}
            </Table>
          ) : (
            <Card className="text-neutral-600">Tutte le varianti hanno almeno 3 pezzi.</Card>
          )}
        </section>
      </div>
    </>
  );
}
