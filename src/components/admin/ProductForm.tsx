"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import FormMessage from "@/components/account/FormMessage";
import SubmitButton from "@/components/account/SubmitButton";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, inputClass } from "@/components/ui/field";
import type { Tables } from "@/types/database";
import { cn } from "@/lib/utils";

type VariantRow = {
  key: string;
  id?: string;
  sku: string;
  colore: string;
  misura: string;
  taglia: string;
  prezzo: string;
  prezzo_barrato: string;
  stock: string;
  ean: string;
};

type Props = {
  product?: Tables<"products"> & { product_variants: Tables<"product_variants">[] };
  brands: Tables<"brands">[];
  categories: (Tables<"categories"> & { depth: number })[];
};

const euro = (c: number | null) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));
let counter = 0;
const emptyRow = (): VariantRow => ({ key: `n${counter++}`, sku: "", colore: "", misura: "", taglia: "", prezzo: "", prezzo_barrato: "", stock: "0", ean: "" });

const COLS: { k: keyof Omit<VariantRow, "key" | "id">; label: string; w: string; mode?: "decimal" | "numeric" }[] = [
  { k: "sku", label: "SKU *", w: "w-36" },
  { k: "colore", label: "Colore", w: "w-28" },
  { k: "misura", label: "Misura", w: "w-32" },
  { k: "taglia", label: "Taglia", w: "w-20" },
  { k: "prezzo", label: "Prezzo € *", w: "w-24", mode: "decimal" },
  { k: "prezzo_barrato", label: "Barrato €", w: "w-24", mode: "decimal" },
  { k: "stock", label: "Pezzi", w: "w-20", mode: "numeric" },
  { k: "ean", label: "EAN", w: "w-36" },
];

export default function ProductForm({ product, brands, categories }: Props) {
  const [state, action] = useFormState(saveProduct, null);
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    product?.product_variants.length
      ? product.product_variants.map((v) => ({
          key: v.id, id: v.id, sku: v.sku, colore: v.colore ?? "", misura: v.misura ?? "", taglia: v.taglia ?? "",
          prezzo: euro(v.prezzo), prezzo_barrato: euro(v.prezzo_barrato), stock: String(v.stock), ean: v.ean ?? "",
        }))
      : [emptyRow()],
  );
  const update = (key: string, k: keyof VariantRow, value: string) =>
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, [k]: value } : r)));

  return (
    <form action={action} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants, (k, v) => (k === "key" ? undefined : v))} />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <Field label="Titolo *"><Input name="titolo" defaultValue={product?.titolo} required /></Field>
          <Field label="Slug (indirizzo della pagina)" hint="Lascia vuoto per crearlo dal titolo. Es. tovaglia-cotone-alviero-martini">
            <Input name="slug" defaultValue={product?.slug} />
          </Field>
          <Field label="Descrizione"><Textarea name="descrizione" rows={6} defaultValue={product?.descrizione ?? ""} /></Field>
          <Field label="Punti chiave" hint="Uno per riga">
            <Textarea name="punti_chiave" rows={5} defaultValue={product?.punti_chiave.join("\n")} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Materiale"><Input name="materiale" defaultValue={product?.materiale ?? ""} /></Field>
            <Field label="Cura e lavaggio"><Input name="cura" defaultValue={product?.cura ?? ""} /></Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <Field label="Stato">
              <Select name="stato" defaultValue={product?.stato ?? "draft"}>
                <option value="published">Pubblicato (visibile sul sito)</option>
                <option value="draft">Bozza (nascosto)</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="in_evidenza" defaultChecked={product?.in_evidenza} className="accent-navy" />
              In evidenza in home
            </label>
            <Field label="Marca">
              <Select name="brand_id" defaultValue={product?.brand_id ?? ""}>
                <option value="">— Nessuna —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </Select>
            </Field>
            <Field label="Categoria">
              <Select name="category_id" defaultValue={product?.category_id ?? ""}>
                <option value="">— Nessuna —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.depth * 2)}{c.nome}</option>)}
              </Select>
            </Field>
          </div>
          <details className="rounded-2xl bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold">SEO (facoltativo)</summary>
            <div className="mt-4 space-y-4">
              <Field label="Titolo per Google"><Input name="seo_title" defaultValue={product?.seo_title ?? ""} maxLength={70} /></Field>
              <Field label="Descrizione per Google"><Textarea name="seo_description" defaultValue={product?.seo_description ?? ""} maxLength={160} /></Field>
            </div>
          </details>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Varianti (taglie, colori, misure)</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setVariants((r) => [...r, emptyRow()])}>
            <Plus size={16} /> Aggiungi variante
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>{COLS.map((c) => <th key={c.k} className="px-1 pb-1 text-left text-xs font-semibold text-neutral-500">{c.label}</th>)}<th /></tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.key}>
                  {COLS.map((c) => (
                    <td key={c.k} className="p-1">
                      <input aria-label={c.label} value={v[c.k]} inputMode={c.mode} onChange={(e) => update(v.key, c.k, e.target.value)}
                        className={cn(inputClass, "px-2 py-1.5", c.w, c.k === "stock" && Number(v.stock) === 0 && "border-red-300 bg-red-50")} />
                    </td>
                  ))}
                  <td className="p-1">
                    <button type="button" aria-label="Rimuovi variante" disabled={variants.length === 1}
                      onClick={() => setVariants((r) => r.filter((x) => x.key !== v.key))}
                      className="rounded-full p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-neutral-500">Con 0 pezzi la variante appare come &quot;Esaurito&quot; e non si può acquistare.</p>
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
        <SubmitButton variant="dark" pendingText="Salvataggio…">{product ? "Salva modifiche" : "Crea prodotto"}</SubmitButton>
        <div className="flex-1"><FormMessage state={state} /></div>
      </div>
    </form>
  );
}
