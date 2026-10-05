import Link from "next/link";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, PageHeader } from "@/components/admin/ui";
import SubmitButton from "@/components/account/SubmitButton";
import { Input, Select } from "@/components/ui/field";
import { requireStaff } from "@/lib/admin";
import { categoryTree } from "@/lib/admin-data";
import type { Tables } from "@/types/database";

export const metadata = { title: "Categorie" };

function CategoryFields({ c, tree }: { c?: Tables<"categories">; tree: ReturnType<typeof categoryTree> }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <Input name="nome" placeholder="Nome" defaultValue={c?.nome} required aria-label="Nome" className="min-w-40 flex-1" />
      <Input name="slug" placeholder="slug (automatico)" defaultValue={c?.slug} aria-label="Slug" className="w-48" />
      <Select name="parent_id" defaultValue={c?.parent_id ?? ""} aria-label="Dentro a" className="w-56">
        <option value="">— Reparto principale —</option>
        {tree.filter((t) => t.id !== c?.id && t.depth === 0).map((t) => <option key={t.id} value={t.id}>dentro: {t.nome}</option>)}
      </Select>
      <Input name="ordine" type="number" defaultValue={c?.ordine ?? 0} aria-label="Ordine" title="Ordine" className="w-20" />
      <SubmitButton size="sm" variant={c ? "outline" : "dark"}>{c ? "Salva" : "Aggiungi"}</SubmitButton>
    </>
  );
}

export default async function AdminCategories() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("categories").select("*");
  const tree = categoryTree(data ?? []);
  return (
    <>
      <PageHeader title="Categorie" />
      <Card className="mb-6">
        <h2 className="mb-3 font-bold">Nuova categoria</h2>
        <ActionForm action={saveCategory} className="flex flex-wrap items-center gap-2"><CategoryFields tree={tree} /></ActionForm>
      </Card>
      <Card className="divide-y divide-neutral-100 p-0">
        {tree.map((c) => (
          <div key={c.id} className="flex flex-wrap items-start gap-2 p-3" style={{ paddingLeft: `${0.75 + c.depth * 2}rem` }}>
            <ActionForm action={saveCategory} className="flex flex-1 flex-wrap items-center gap-2"><CategoryFields c={c} tree={tree} /></ActionForm>
            <div className="flex items-center gap-1">
              <Link href={`/c/${c.slug}`} target="_blank" className="px-2 py-1.5 text-sm text-navy hover:underline">Vedi</Link>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton message={`Eliminare "${c.nome}"? I prodotti resteranno senza categoria.`} label="" />
              </form>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
