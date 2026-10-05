import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteProduct } from "@/app/admin/actions";
import ImageManager from "@/components/admin/ImageManager";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { buttonVariants } from "@/components/ui/button";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireStaff } from "@/lib/admin";
import { categoryTree } from "@/lib/admin-data";

export const metadata = { title: "Modifica prodotto" };

export default async function EditProduct({ params, searchParams }: { params: { id: string }; searchParams: { creato?: string } }) {
  const { supabase } = await requireStaff();
  const [product, brands, categories] = await Promise.all([
    supabase.from("products").select("*, product_variants(*), product_images(*)").eq("id", params.id).maybeSingle(),
    supabase.from("brands").select("*").order("nome"),
    supabase.from("categories").select("*"),
  ]);
  const p = product.data;
  if (!p) notFound();
  const variants = [...p.product_variants].sort((a, b) => a.sku.localeCompare(b.sku));
  const images = [...p.product_images].sort((a, b) => a.ordine - b.ordine);

  return (
    <>
      <Link href="/admin/prodotti" className="text-sm text-navy hover:underline">← Prodotti</Link>
      <PageHeader title={p.titolo}>
        {p.stato === "published" && (
          <Link href={`/p/${p.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink size={16} /> Vedi sul sito
          </Link>
        )}
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message="Eliminare definitivamente il prodotto, le varianti e le foto?" />
        </form>
      </PageHeader>
      {searchParams.creato && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">Prodotto creato. Ora carica le foto qui sotto.</p>
      )}
      <div className="space-y-6">
        <ImageManager productId={p.id} titolo={p.titolo} images={images} variants={variants} />
        <ProductForm product={{ ...p, product_variants: variants }} brands={brands.data ?? []} categories={categoryTree(categories.data ?? [])} />
      </div>
    </>
  );
}
