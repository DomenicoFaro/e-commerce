import Link from "next/link";
import { Badge, Empty, PageHeader, Table, Td } from "@/components/admin/ui";
import { requireStaff } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { STATI_ORDINE } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

export const metadata = { title: "Ordini" };

export default async function AdminOrders({ searchParams }: { searchParams: { stato?: string } }) {
  const { supabase } = await requireStaff();
  const stato = searchParams.stato && searchParams.stato in STATI_ORDINE ? (searchParams.stato as Enums<"order_status">) : null;
  let q = supabase.from("orders").select("id, numero, email, stato, totale, metodo_consegna, created_at").order("created_at", { ascending: false }).limit(200);
  if (stato) q = q.eq("stato", stato);
  const { data } = await q;

  return (
    <>
      <PageHeader title="Ordini" />
      <nav className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/ordini" className={cn("rounded-full px-3 py-1", !stato ? "bg-navy text-white" : "bg-white")}>Tutti</Link>
        {Object.entries(STATI_ORDINE).map(([k, v]) => (
          <Link key={k} href={`/admin/ordini?stato=${k}`} className={cn("rounded-full px-3 py-1", stato === k ? "bg-navy text-white" : "bg-white")}>{v.label}</Link>
        ))}
      </nav>
      {!data?.length ? (
        <Empty>Nessun ordine{stato ? " in questo stato" : ""}. Gli ordini arriveranno quando sarà attivo il pagamento online.</Empty>
      ) : (
        <Table head={["Numero", "Data", "Cliente", "Consegna", "Stato", "Totale"]}>
          {data.map((o) => (
            <tr key={o.id} className="hover:bg-neutral-50">
              <Td><Link href={`/admin/ordini/${o.id}`} className="font-semibold text-navy hover:underline">{o.numero}</Link></Td>
              <Td>{new Date(o.created_at).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}</Td>
              <Td>{o.email}</Td>
              <Td>{o.metodo_consegna === "pickup" ? "Ritiro" : "Spedizione"}</Td>
              <Td><Badge className={STATI_ORDINE[o.stato].classe}>{STATI_ORDINE[o.stato].label}</Badge></Td>
              <Td className="font-semibold">{formatPrice(o.totale)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
