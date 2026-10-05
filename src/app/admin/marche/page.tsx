import { deleteBrand, saveBrand } from "@/app/admin/actions";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, PageHeader } from "@/components/admin/ui";
import SubmitButton from "@/components/account/SubmitButton";
import { Input } from "@/components/ui/field";
import { requireStaff } from "@/lib/admin";
import type { Tables } from "@/types/database";

export const metadata = { title: "Marche" };

function BrandFields({ b }: { b?: Tables<"brands"> }) {
  return (
    <>
      {b && <input type="hidden" name="id" value={b.id} />}
      <Input name="nome" placeholder="Nome" defaultValue={b?.nome} required aria-label="Nome" className="w-48" />
      <Input name="slug" placeholder="slug (automatico)" defaultValue={b?.slug} aria-label="Slug" className="w-44" />
      <Input name="descrizione" placeholder="Descrizione breve" defaultValue={b?.descrizione ?? ""} aria-label="Descrizione" className="min-w-48 flex-1" />
      <SubmitButton size="sm" variant={b ? "outline" : "dark"}>{b ? "Salva" : "Aggiungi"}</SubmitButton>
    </>
  );
}

export default async function AdminBrands() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("brands").select("*").order("nome");
  return (
    <>
      <PageHeader title="Marche" />
      <Card className="mb-6">
        <h2 className="mb-3 font-bold">Nuova marca</h2>
        <ActionForm action={saveBrand} className="flex flex-wrap items-center gap-2"><BrandFields /></ActionForm>
      </Card>
      <Card className="divide-y divide-neutral-100 p-0">
        {(data ?? []).map((b) => (
          <div key={b.id} className="flex flex-wrap items-start gap-2 p-3">
            <ActionForm action={saveBrand} className="flex flex-1 flex-wrap items-center gap-2"><BrandFields b={b} /></ActionForm>
            <form action={deleteBrand}>
              <input type="hidden" name="id" value={b.id} />
              <ConfirmButton message={`Eliminare "${b.nome}"? I prodotti resteranno senza marca.`} label="" />
            </form>
          </div>
        ))}
      </Card>
    </>
  );
}
