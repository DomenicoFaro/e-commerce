"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { addImages, deleteImage, reorderImages, setImageVariant } from "@/app/admin/actions";
import ProductImage from "@/components/catalog/ProductImage";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Props = {
  productId: string;
  titolo: string;
  images: Tables<"product_images">[];
  variants: Tables<"product_variants">[];
};

const MAX_MB = 8;

/** Foto prodotto: caricamento nel bucket Supabase dal browser, ordine e associazione a una variante. */
export default function ImageManager({ productId, titolo, images, variants }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: { url: string; alt: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { setError(`${file.name}: non è un'immagine.`); continue; }
      if (file.size > MAX_MB * 1024 * 1024) { setError(`${file.name}: supera ${MAX_MB} MB.`); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000" });
      if (upErr) { setError(`${file.name}: ${upErr.message}`); continue; }
      uploaded.push({ url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl, alt: titolo });
    }
    if (uploaded.length) {
      const res = await addImages(productId, uploaded);
      if (res.error) setError(res.error);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  function move(i: number, dir: -1 | 1) {
    const ids = images.map((img) => img.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    run(() => reorderImages(ids));
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Foto</h2>
          <p className="text-xs text-neutral-500">La prima foto è quella principale. JPG, PNG o WebP fino a {MAX_MB} MB.</p>
        </div>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <Button type="button" variant="dark" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
          <ImagePlus size={16} /> {uploading ? "Caricamento…" : "Carica foto"}
        </Button>
      </div>
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {images.length === 0 ? (
        <button type="button" onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 p-10 text-neutral-500 hover:border-navy hover:text-navy">
          <ImagePlus size={32} /> Clicca per caricare le foto del prodotto
        </button>
      ) : (
        <ul className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {images.map((img, i) => (
            <li key={img.id} className="space-y-2 rounded-xl border border-neutral-200 p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <ProductImage src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-navy px-1.5 text-xs font-semibold text-white">Principale</span>}
              </div>
              {variants.length > 1 && (
                <select aria-label="Variante" value={img.variant_id ?? ""} onChange={(e) => run(() => setImageVariant(img.id, e.target.value || null))}
                  className="w-full rounded border border-neutral-300 px-1 py-1 text-xs">
                  <option value="">Tutte le varianti</option>
                  {variants.map((v) => <option key={v.id} value={v.id}>{[v.colore, v.misura, v.taglia].filter(Boolean).join(" · ") || v.sku}</option>)}
                </select>
              )}
              <div className="flex justify-between">
                <div className="flex">
                  <button type="button" aria-label="Sposta a sinistra" disabled={i === 0 || pending} onClick={() => move(i, -1)} className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-30"><ArrowLeft size={16} /></button>
                  <button type="button" aria-label="Sposta a destra" disabled={i === images.length - 1 || pending} onClick={() => move(i, 1)} className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-30"><ArrowRight size={16} /></button>
                </div>
                <button type="button" aria-label="Elimina foto" disabled={pending}
                  onClick={() => confirm("Eliminare questa foto?") && run(() => deleteImage(img.id))}
                  className="rounded p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
