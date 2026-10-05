"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { redirect } from "next/navigation";
import { euroToCents, field, fieldOrNull, requireAdmin, requireStaff, slugify } from "@/lib/admin";
import { PAGINE, SETTINGS_TAG } from "@/lib/settings";
import type { Enums, Json } from "@/types/database";

// Tutte le scritture usano la sessione dell'utente: la RLS verifica ruolo staff/admin.

export type AdminState = { error?: string; message?: string } | null;

const BUCKET = "product-images";

/** Svuota la cache del catalogo e aggiorna subito tutte le pagine pubbliche. */
const refresh = (tag = CATALOG_TAG) => {
  revalidateTag(tag);
  revalidatePath("/", "layout");
};

const dbError = (e: { code?: string; message: string }) =>
  e.code === "23505" ? "Esiste già un elemento con questo slug o codice." :
  e.code === "23503" ? "Elemento collegato ad altri dati: non può essere eliminato." :
  e.code === "23514" ? "Valori non validi (controlla prezzi, prezzo barrato e quantità)." :
  e.code === "42501" ? "Permessi insufficienti." : e.message;

// ───────────── Prodotti ─────────────

type VariantInput = {
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

export async function saveProduct(_: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireStaff();
  const id = field(form, "id");
  const titolo = field(form, "titolo");
  if (!titolo) return { error: "Il titolo è obbligatorio." };

  let variants: VariantInput[];
  try {
    variants = JSON.parse(field(form, "variants") || "[]");
  } catch {
    return { error: "Varianti non valide." };
  }
  if (!variants.length) return { error: "Aggiungi almeno una variante (con prezzo e quantità)." };

  const rows = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const prezzo = euroToCents(v.prezzo);
    const barrato = euroToCents(v.prezzo_barrato);
    const stock = Number(v.stock || 0);
    if (!v.sku.trim()) return { error: `Variante ${i + 1}: il codice SKU è obbligatorio.` };
    if (prezzo === null || Number.isNaN(prezzo)) return { error: `Variante ${i + 1}: prezzo non valido.` };
    if (Number.isNaN(barrato)) return { error: `Variante ${i + 1}: prezzo barrato non valido.` };
    if (barrato !== null && barrato <= prezzo) return { error: `Variante ${i + 1}: il prezzo barrato deve essere maggiore del prezzo.` };
    if (!Number.isInteger(stock) || stock < 0) return { error: `Variante ${i + 1}: quantità non valida.` };
    rows.push({
      id: v.id,
      sku: v.sku.trim(),
      colore: v.colore.trim() || null,
      misura: v.misura.trim() || null,
      taglia: v.taglia.trim() || null,
      prezzo,
      prezzo_barrato: barrato,
      stock,
      ean: v.ean.trim() || null,
    });
  }

  const product = {
    titolo,
    slug: slugify(field(form, "slug") || titolo),
    brand_id: fieldOrNull(form, "brand_id"),
    category_id: fieldOrNull(form, "category_id"),
    descrizione: fieldOrNull(form, "descrizione"),
    punti_chiave: field(form, "punti_chiave").split("\n").map((s) => s.trim()).filter(Boolean),
    materiale: fieldOrNull(form, "materiale"),
    cura: fieldOrNull(form, "cura"),
    stato: (field(form, "stato") === "published" ? "published" : "draft") as Enums<"product_status">,
    in_evidenza: form.get("in_evidenza") === "on",
    seo_title: fieldOrNull(form, "seo_title"),
    seo_description: fieldOrNull(form, "seo_description"),
  };

  const saved = id
    ? await supabase.from("products").update(product).eq("id", id).select("id").single()
    : await supabase.from("products").insert(product).select("id").single();
  if (saved.error) return { error: dbError(saved.error) };
  const productId = saved.data.id;

  // Varianti: elimina le rimosse, aggiorna le esistenti, inserisce le nuove
  const keep = rows.flatMap((r) => (r.id ? [r.id] : []));
  const del = supabase.from("product_variants").delete().eq("product_id", productId);
  const { error: delErr } = keep.length ? await del.not("id", "in", `(${keep.join(",")})`) : await del;
  if (delErr) return { error: dbError(delErr) };
  for (const { id: vid, ...r } of rows) {
    const { error } = vid
      ? await supabase.from("product_variants").update(r).eq("id", vid)
      : await supabase.from("product_variants").insert({ ...r, product_id: productId });
    if (error) return { error: `Variante ${r.sku}: ${dbError(error)}` };
  }

  refresh();
  if (!id) redirect(`/admin/prodotti/${productId}?creato=1`);
  return { message: "Prodotto salvato." };
}

export async function deleteProduct(form: FormData) {
  const { supabase } = await requireStaff();
  const id = field(form, "id");
  const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id);
  await supabase.from("products").delete().eq("id", id);
  await removeStorageFiles(supabase, (imgs ?? []).map((i) => i.url));
  refresh();
  redirect("/admin/prodotti");
}

// ───────────── Immagini ─────────────

type Supabase = Awaited<ReturnType<typeof requireStaff>>["supabase"];

async function removeStorageFiles(supabase: Supabase, urls: string[]) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const paths = urls.filter((u) => u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

/** Registra le immagini già caricate nello storage dal browser. */
export async function addImages(productId: string, images: { url: string; alt: string }[]) {
  const { supabase } = await requireStaff();
  const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  const { error } = await supabase
    .from("product_images")
    .insert(images.map((img, i) => ({ product_id: productId, url: img.url, alt: img.alt, ordine: (count ?? 0) + i })));
  if (error) return { error: dbError(error) };
  // Rimuove il segnaposto quando arrivano le foto vere
  await supabase.from("product_images").delete().eq("product_id", productId).eq("url", "/placeholder.svg");
  refresh();
  return {};
}

export async function deleteImage(id: string) {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("product_images").delete().eq("id", id).select("url").single();
  if (data) await removeStorageFiles(supabase, [data.url]);
  refresh();
}

export async function reorderImages(ids: string[]) {
  const { supabase } = await requireStaff();
  await Promise.all(ids.map((id, ordine) => supabase.from("product_images").update({ ordine }).eq("id", id)));
  refresh();
}

export async function setImageVariant(id: string, variantId: string | null) {
  const { supabase } = await requireStaff();
  await supabase.from("product_images").update({ variant_id: variantId }).eq("id", id);
  refresh();
}

// ───────────── Categorie e marche ─────────────

export async function saveCategory(_: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireStaff();
  const id = field(form, "id");
  const nome = field(form, "nome");
  if (!nome) return { error: "Il nome è obbligatorio." };
  const parent = fieldOrNull(form, "parent_id");
  if (id && parent === id) return { error: "Una categoria non può essere dentro sé stessa." };
  const row = { nome, slug: slugify(field(form, "slug") || nome), parent_id: parent, ordine: Number(field(form, "ordine") || 0) };
  const { error } = id ? await supabase.from("categories").update(row).eq("id", id) : await supabase.from("categories").insert(row);
  if (error) return { error: dbError(error) };
  refresh();
  return { message: id ? "Categoria salvata." : "Categoria creata." };
}

export async function deleteCategory(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("categories").delete().eq("id", field(form, "id"));
  refresh();
}

export async function saveBrand(_: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireStaff();
  const id = field(form, "id");
  const nome = field(form, "nome");
  if (!nome) return { error: "Il nome è obbligatorio." };
  const row = { nome, slug: slugify(field(form, "slug") || nome), descrizione: fieldOrNull(form, "descrizione") };
  const { error } = id ? await supabase.from("brands").update(row).eq("id", id) : await supabase.from("brands").insert(row);
  if (error) return { error: dbError(error) };
  refresh();
  return { message: id ? "Marca salvata." : "Marca creata." };
}

export async function deleteBrand(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("brands").delete().eq("id", field(form, "id"));
  refresh();
}

// ───────────── Ordini ─────────────

export async function updateOrder(_: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireStaff();
  const id = field(form, "id");
  const { error } = await supabase
    .from("orders")
    .update({
      stato: field(form, "stato") as Enums<"order_status">,
      tracking: fieldOrNull(form, "tracking"),
      note: fieldOrNull(form, "note"),
    })
    .eq("id", id);
  if (error) return { error: dbError(error) };
  revalidatePath("/admin/ordini");
  return { message: "Ordine aggiornato." };
}

// ───────────── Coupon ─────────────

export async function saveCoupon(_: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireStaff();
  const codice = field(form, "codice").toUpperCase().replace(/\s/g, "");
  if (!codice) return { error: "Il codice è obbligatorio." };
  const tipo = field(form, "tipo") === "fixed" ? "fixed" : "percent";
  const valore = tipo === "fixed" ? euroToCents(field(form, "valore")) : Number(field(form, "valore"));
  if (!valore || Number.isNaN(valore) || valore <= 0 || (tipo === "percent" && valore > 100)) {
    return { error: "Valore non valido (percentuale 1–100 o importo in euro)." };
  }
  const minimo = euroToCents(field(form, "minimo_ordine")) ?? 0;
  if (Number.isNaN(minimo)) return { error: "Minimo ordine non valido." };
  const max = field(form, "utilizzi_max");
  const scadenza = field(form, "scadenza");
  const row = {
    codice,
    tipo: tipo as Enums<"coupon_type">,
    valore: Math.round(valore),
    minimo_ordine: minimo,
    utilizzi_max: max ? Number(max) : null,
    scadenza: scadenza ? new Date(`${scadenza}T23:59:59`).toISOString() : null,
    attivo: form.get("attivo") === "on",
  };
  const { error } = field(form, "esistente")
    ? await supabase.from("coupons").update(row).eq("codice", field(form, "esistente"))
    : await supabase.from("coupons").insert(row);
  if (error) return { error: dbError(error) };
  revalidatePath("/admin/coupon");
  return { message: "Coupon salvato." };
}

export async function deleteCoupon(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("coupons").delete().eq("codice", field(form, "codice"));
  revalidatePath("/admin/coupon");
}

// ───────────── Recensioni ─────────────

export async function setReviewApproved(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("reviews").update({ approvata: form.get("approvata") === "1" }).eq("id", field(form, "id"));
  refresh();
}

export async function deleteReview(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("reviews").delete().eq("id", field(form, "id"));
  refresh();
}

// ───────────── Utenti (solo admin) ─────────────

export async function setUserRole(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = field(form, "id");
  if (id === user.id) return; // evita di togliersi da soli i permessi
  const ruolo = field(form, "ruolo") as Enums<"user_role">;
  await supabase.from("profiles").update({ ruolo }).eq("id", id);
  revalidatePath("/admin/utenti");
}

// ───────────── Impostazioni e pagine (solo admin) ─────────────

async function upsertSetting(chiave: string, valore: Json) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("settings").upsert({ chiave, valore });
  if (error) return { error: dbError(error) };
  refresh(SETTINGS_TAG);
  return { message: "Salvato." };
}

export async function saveNegozio(_: AdminState, form: FormData): Promise<AdminState> {
  const keys = ["ragione_sociale", "piva", "indirizzo", "telefono", "email", "whatsapp", "orari_testo"];
  return upsertSetting("negozio", Object.fromEntries(keys.map((k) => [k, field(form, k)])));
}

export async function saveHome(_: AdminState, form: FormData): Promise<AdminState> {
  const keys = ["titolo", "sottotitolo", "cta_testo", "cta_link"];
  return upsertSetting("home", Object.fromEntries(keys.map((k) => [k, field(form, k)])));
}

export async function saveSpedizione(_: AdminState, form: FormData): Promise<AdminState> {
  const costo = euroToCents(field(form, "costo"));
  const soglia = euroToCents(field(form, "soglia"));
  if (Number.isNaN(costo) || Number.isNaN(soglia)) return { error: "Importi non validi." };
  const a = await upsertSetting("costo_spedizione", { cents: costo });
  if (a.error) return a;
  return upsertSetting("soglia_spedizione_gratuita", { cents: soglia });
}

export async function savePagina(_: AdminState, form: FormData): Promise<AdminState> {
  const slug = field(form, "slug");
  if (!(slug in PAGINE)) return { error: "Pagina sconosciuta." };
  return upsertSetting(`pagina:${slug}`, { titolo: field(form, "titolo"), testo: field(form, "testo") });
}
