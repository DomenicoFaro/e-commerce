import { deleteCoupon, saveCoupon } from "@/app/admin/actions";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, PageHeader } from "@/components/admin/ui";
import SubmitButton from "@/components/account/SubmitButton";
import { Field, Input, Select } from "@/components/ui/field";
import { centsToEuro, requireStaff } from "@/lib/admin";
import type { Tables } from "@/types/database";

export const metadata = { title: "Coupon" };

function CouponFields({ c }: { c?: Tables<"coupons"> }) {
  return (
    <>
      {c && <input type="hidden" name="esistente" value={c.codice} />}
      <Field label="Codice" className="w-36"><Input name="codice" defaultValue={c?.codice} required className="uppercase" /></Field>
      <Field label="Tipo" className="w-36">
        <Select name="tipo" defaultValue={c?.tipo ?? "percent"}>
          <option value="percent">Percentuale %</option>
          <option value="fixed">Importo €</option>
        </Select>
      </Field>
      <Field label="Valore" className="w-24">
        <Input name="valore" inputMode="decimal" required defaultValue={c ? (c.tipo === "fixed" ? centsToEuro(c.valore) : c.valore) : ""} />
      </Field>
      <Field label="Minimo €" className="w-24"><Input name="minimo_ordine" inputMode="decimal" defaultValue={c ? centsToEuro(c.minimo_ordine) : ""} /></Field>
      <Field label="Usi max" className="w-24"><Input name="utilizzi_max" type="number" min={1} defaultValue={c?.utilizzi_max ?? ""} /></Field>
      <Field label="Scadenza" className="w-40"><Input name="scadenza" type="date" defaultValue={c?.scadenza?.slice(0, 10) ?? ""} /></Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="attivo" defaultChecked={c?.attivo ?? true} className="accent-navy" /> Attivo
      </label>
      <div className="self-end"><SubmitButton size="sm" variant={c ? "outline" : "dark"}>{c ? "Salva" : "Crea"}</SubmitButton></div>
    </>
  );
}

export default async function AdminCoupons() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("coupons").select("*").order("codice");
  return (
    <>
      <PageHeader title="Coupon" />
      <Card className="mb-6">
        <h2 className="mb-3 font-bold">Nuovo coupon</h2>
        <ActionForm action={saveCoupon} className="flex flex-wrap gap-3"><CouponFields /></ActionForm>
      </Card>
      <div className="space-y-3">
        {(data ?? []).map((c) => (
          <Card key={c.codice} className="flex flex-wrap items-start gap-3">
            <ActionForm action={saveCoupon} className="flex flex-1 flex-wrap gap-3"><CouponFields c={c} /></ActionForm>
            <div className="text-right text-sm">
              <p className="text-neutral-600">Usato {c.utilizzi}{c.utilizzi_max ? `/${c.utilizzi_max}` : ""} volte</p>
              <form action={deleteCoupon}>
                <input type="hidden" name="codice" value={c.codice} />
                <ConfirmButton message={`Eliminare il coupon ${c.codice}?`} />
              </form>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
