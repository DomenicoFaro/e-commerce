import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrder } from "@/app/admin/actions";
import ActionForm from "@/components/admin/ActionForm";
import { Badge, Card, PageHeader, Table, Td } from "@/components/admin/ui";
import SubmitButton from "@/components/account/SubmitButton";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireStaff } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { STATI_ORDINE } from "@/lib/orders";

export const metadata = { title: "Ordine" };

export default async function AdminOrder({ params }: { params: { id: string } }) {
  const { supabase } = await requireStaff();
  const { data: o } = await supabase.from("orders").select("*, order_items(*)").eq("id", params.id).maybeSingle();
  if (!o) notFound();
  const ind = o.indirizzo && typeof o.indirizzo === "object" && !Array.isArray(o.indirizzo) ? o.indirizzo : null;

  return (
    <>
      <Link href="/admin/ordini" className="text-sm text-navy hover:underline">← Ordini</Link>
      <PageHeader title={`Ordine ${o.numero}`}>
        <Badge className={STATI_ORDINE[o.stato].classe}>{STATI_ORDINE[o.stato].label}</Badge>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Table head={["Articolo", "Prezzo", "Qtà", "Totale"]}>
            {o.order_items.map((i) => (
              <tr key={i.id}>
                <Td>{i.titolo}</Td><Td>{formatPrice(i.prezzo)}</Td><Td>{i.quantita}</Td><Td>{formatPrice(i.prezzo * i.quantita)}</Td>
              </tr>
            ))}
          </Table>
          <Card>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotale</dt><dd>{formatPrice(o.subtotale)}</dd></div>
              <div className="flex justify-between"><dt>Spedizione</dt><dd>{formatPrice(o.spedizione)}</dd></div>
              {o.sconto > 0 && <div className="flex justify-between"><dt>Sconto {o.coupon_code && `(${o.coupon_code})`}</dt><dd>-{formatPrice(o.sconto)}</dd></div>}
              <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Totale</dt><dd>{formatPrice(o.totale)}</dd></div>
            </dl>
          </Card>
          <Card className="text-sm">
            <h2 className="mb-2 font-bold">Cliente e consegna</h2>
            <p>{o.email}</p>
            <p className="mt-2 font-semibold">{o.metodo_consegna === "pickup" ? "Ritiro in negozio" : "Spedizione"}</p>
            {ind && (
              <p className="whitespace-pre-line text-neutral-700">
                {[ind.nome, `${ind.via ?? ""} ${ind.civico ?? ""}`, `${ind.cap ?? ""} ${ind.citta ?? ""} (${ind.provincia ?? ""})`, ind.telefono].filter(Boolean).join("\n")}
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              Creato il {new Date(o.created_at).toLocaleString("it-IT")} · Stock scalato: {o.stock_scalato ? "sì" : "no"}
            </p>
          </Card>
        </div>
        <Card className="h-fit">
          <h2 className="mb-3 font-bold">Gestisci</h2>
          <ActionForm action={updateOrder} className="space-y-4">
            <input type="hidden" name="id" value={o.id} />
            <Field label="Stato">
              <Select name="stato" defaultValue={o.stato}>
                {Object.entries(STATI_ORDINE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
            <Field label="Codice tracking"><Input name="tracking" defaultValue={o.tracking ?? ""} /></Field>
            <Field label="Note interne"><Textarea name="note" defaultValue={o.note ?? ""} /></Field>
            <SubmitButton variant="dark">Salva</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
