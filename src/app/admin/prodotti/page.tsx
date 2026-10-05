import Link from "next/link";
import { Plus } from "lucide-react";
import ProductImage from "@/components/catalog/ProductImage";
import { Badge, Empty, PageHeader, Table, Td } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/field";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireStaff } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

type Props = { searchParams: { q?: string; stato?: string } };

export default async function AdminProducts({ searchParams }: Props) {
  const { supabase } = await requireStaff();
  let query = supabase
    .from("products")
    .select("id, titolo, slug, stato, in_evidenza, brands(nome), categories(nome), product_variants(prezzo, stock), product_images(url, ordine)")
    .order("created_at", { ascending: false });
  if (searchParams.q) query = query.ilike("titolo", `%${searchParams.q}%`);
  if (searchParams.stato === "draft" || searchParams.stato === "published") query = query.eq("stato", searchParams.stato);
  const { data: products } = await query;

  return (
    <>
      <PageHeader title="Prodotti">
        <Link href="/admin/prodotti/nuovo" className={buttonVariants({ variant: "dark" })}><Plus size={18} /> Nuovo prodotto</Link>
      </PageHeader>
      <form className="mb-4 flex flex-wrap gap-2">
        <Input name="q" placeholder="Cerca per titolo…" defaultValue={searchParams.q} className="max-w-xs" />
        <Select name="stato" defaultValue={searchParams.stato ?? ""} className="w-auto">
          <option value="">Tutti gli stati</option>
          <option value="published">Pubblicati</option>
          <option value="draft">Bozze</option>
        </Select>
        <Button variant="outline">Filtra</Button>
      </form>
      {!products?.length ? (
        <Empty href="/admin/prodotti/nuovo" cta="Crea il primo prodotto">Nessun prodotto trovato.</Empty>
      ) : (
        <Table head={["", "Prodotto", "Categoria", "Prezzo", "Pezzi", "Stato"]}>
          {products.map((p) => {
            const img = [...p.product_images].sort((a, b) => a.ordine - b.ordine)[0];
            const prezzi = p.product_variants.map((v) => v.prezzo);
            const stock = p.product_variants.reduce((t, v) => t + v.stock, 0);
            return (
              <tr key={p.id} className="hover:bg-neutral-50">
                <Td className="w-16">
                  <div className="relative size-12 overflow-hidden rounded-lg bg-neutral-100">
                    <ProductImage src={img?.url ?? "/placeholder.svg"} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                </Td>
                <Td>
                  <Link href={`/admin/prodotti/${p.id}`} className="font-semibold text-navy hover:underline">{p.titolo}</Link>
                  <p className="text-xs text-neutral-500">{p.brands?.nome ?? "—"}{p.in_evidenza && " · ★ In evidenza"}</p>
                </Td>
                <Td>{p.categories?.nome ?? "—"}</Td>
                <Td>{prezzi.length ? formatPrice(Math.min(...prezzi)) : "—"}</Td>
                <Td><Badge className={stock === 0 ? "bg-red-100 text-red-800" : "bg-neutral-100"}>{stock}</Badge></Td>
                <Td>
                  <Badge className={p.stato === "published" ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}>
                    {p.stato === "published" ? "Pubblicato" : "Bozza"}
                  </Badge>
                </Td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}
