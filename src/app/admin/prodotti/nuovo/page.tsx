import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/admin";
import { categoryTree } from "@/lib/admin-data";

export const metadata = { title: "Nuovo prodotto" };

export default async function NewProduct() {
  const { supabase } = await requireStaff();
  const [brands, categories] = await Promise.all([
    supabase.from("brands").select("*").order("nome"),
    supabase.from("categories").select("*"),
  ]);
  return (
    <>
      <Link href="/admin/prodotti" className="text-sm text-navy hover:underline">← Prodotti</Link>
      <PageHeader title="Nuovo prodotto" />
      <p className="mb-4 text-sm text-neutral-600">Dopo aver creato il prodotto potrai caricare le foto.</p>
      <ProductForm brands={brands.data ?? []} categories={categoryTree(categories.data ?? [])} />
    </>
  );
}
