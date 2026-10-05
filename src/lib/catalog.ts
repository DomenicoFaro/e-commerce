import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

// Query del catalogo. Il negozio ha poche centinaia di prodotti: i filtri sulle varianti
// (prezzo, colore, misura, disponibilità) sono calcolati qui invece che in SQL.

export type Category = Tables<"categories">;
export type Variant = Tables<"product_variants">;

const LIST_SELECT =
  "id, titolo, slug, created_at, in_evidenza, category_id, brands(nome, slug), product_variants(id, prezzo, prezzo_barrato, stock, colore, misura, taglia), product_images(url, alt, ordine)";

const db = () => createPublicClient();

/** Prodotto nella griglia, con i valori aggregati dalle varianti. */
export type ProductCardData = {
  id: string;
  titolo: string;
  slug: string;
  createdAt: string;
  marca: { nome: string; slug: string } | null;
  immagine: { url: string; alt: string };
  prezzoMin: number;
  prezzoBarrato: number | null;
  disponibile: boolean;
  colori: string[];
  misure: string[];
};

type ListRow = {
  id: string;
  titolo: string;
  slug: string;
  created_at: string;
  brands: { nome: string; slug: string } | null;
  product_variants: Pick<Variant, "id" | "prezzo" | "prezzo_barrato" | "stock" | "colore" | "misura" | "taglia">[];
  product_images: { url: string; alt: string; ordine: number }[];
};

const uniq = (values: (string | null)[]) => Array.from(new Set(values.filter((v): v is string => !!v)));

function toCard(p: ListRow): ProductCardData {
  const variants = p.product_variants;
  const cheapest = variants.reduce<ListRow["product_variants"][number] | null>(
    (min, v) => (!min || v.prezzo < min.prezzo ? v : min),
    null,
  );
  const img = [...p.product_images].sort((a, b) => a.ordine - b.ordine)[0];
  return {
    id: p.id,
    titolo: p.titolo,
    slug: p.slug,
    createdAt: p.created_at,
    marca: p.brands,
    immagine: { url: img?.url ?? "/placeholder.svg", alt: img?.alt || p.titolo },
    prezzoMin: cheapest?.prezzo ?? 0,
    prezzoBarrato: cheapest?.prezzo_barrato ?? null,
    disponibile: variants.some((v) => v.stock > 0),
    colori: uniq(variants.map((v) => v.colore)),
    misure: uniq(variants.flatMap((v) => [v.misura, v.taglia])),
  };
}

// ───────────── Categorie ─────────────

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await db().from("categories").select("*").order("ordine");
  if (error) throw error;
  return data;
});

export const getDepartments = async () => (await getCategories()).filter((c) => !c.parent_id);

/** Categoria, percorso dalla radice, sottocategorie dirette e id di tutto il sottoalbero. */
export async function getCategoryBySlug(slug: string) {
  const all = await getCategories();
  const category = all.find((c) => c.slug === slug);
  if (!category) return null;

  const path: Category[] = [];
  for (let c: Category | undefined = category; c; c = all.find((x) => x.id === c!.parent_id)) path.unshift(c);

  const ids = [category.id];
  for (let i = 0; i < ids.length; i++) all.filter((c) => c.parent_id === ids[i]).forEach((c) => ids.push(c.id));

  return { category, path, children: all.filter((c) => c.parent_id === category.id), ids };
}

// ───────────── Prodotti ─────────────

export const SORTS = {
  rilevanza: "Rilevanza",
  novita: "Novità",
  "prezzo-asc": "Prezzo crescente",
  "prezzo-desc": "Prezzo decrescente",
} as const;
export type Sort = keyof typeof SORTS;

export type ListFilters = {
  categoryIds?: string[];
  brandSlug?: string;
  productIds?: string[]; // risultati della ricerca, già in ordine di rilevanza
  soloOfferte?: boolean;
  marche?: string[];
  colori?: string[];
  misure?: string[];
  prezzoMin?: number; // centesimi
  prezzoMax?: number;
  disponibili?: boolean;
  sort?: Sort;
};

/** Valori disponibili per i filtri, calcolati prima di applicarli. */
export type Facets = { marche: { nome: string; slug: string }[]; colori: string[]; misure: string[] };

export async function listProducts(f: ListFilters): Promise<{ products: ProductCardData[]; facets: Facets }> {
  if (f.productIds?.length === 0) return { products: [], facets: { marche: [], colori: [], misure: [] } };

  let q = db().from("products").select(LIST_SELECT).eq("stato", "published");
  if (f.categoryIds) q = q.in("category_id", f.categoryIds);
  if (f.productIds) q = q.in("id", f.productIds);
  const { data, error } = await q;
  if (error) throw error;

  let cards = (data as unknown as ListRow[]).map(toCard);
  if (f.brandSlug) cards = cards.filter((p) => p.marca?.slug === f.brandSlug);
  if (f.soloOfferte) cards = cards.filter((p) => p.prezzoBarrato !== null);

  const marche = new Map(cards.flatMap((p) => (p.marca ? [[p.marca.slug, p.marca] as const] : [])));
  const facets: Facets = {
    marche: Array.from(marche.values()).sort((a, b) => a.nome.localeCompare(b.nome, "it")),
    colori: uniq(cards.flatMap((p) => p.colori)).sort((a, b) => a.localeCompare(b, "it")),
    misure: uniq(cards.flatMap((p) => p.misure)).sort((a, b) => a.localeCompare(b, "it", { numeric: true })),
  };

  const has = (list: string[] | undefined, values: string[]) => !list?.length || values.some((v) => list.includes(v));
  cards = cards.filter(
    (p) =>
      has(f.marche, p.marca ? [p.marca.slug] : []) &&
      has(f.colori, p.colori) &&
      has(f.misure, p.misure) &&
      (f.prezzoMin === undefined || p.prezzoMin >= f.prezzoMin) &&
      (f.prezzoMax === undefined || p.prezzoMin <= f.prezzoMax) &&
      (!f.disponibili || p.disponibile),
  );

  const sort = f.sort ?? (f.productIds ? "rilevanza" : "novita");
  if (sort === "rilevanza" && f.productIds) {
    const pos = new Map(f.productIds.map((id, i) => [id, i]));
    cards.sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
  } else if (sort === "prezzo-asc") cards.sort((a, b) => a.prezzoMin - b.prezzoMin);
  else if (sort === "prezzo-desc") cards.sort((a, b) => b.prezzoMin - a.prezzoMin);
  else cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // I disponibili prima degli esauriti, mantenendo l'ordinamento scelto
  cards.sort((a, b) => Number(b.disponibile) - Number(a.disponibile));
  return { products: cards, facets };
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await db()
    .from("products")
    .select(LIST_SELECT)
    .eq("stato", "published")
    .eq("in_evidenza", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as ListRow[]).map(toCard);
}

/** Id dei prodotti trovati, in ordine di rilevanza. */
export async function searchProductIds(q: string, max = 100) {
  const { data, error } = await db().rpc("search_products", { q, max_results: max });
  if (error) throw error;
  return data.map((r) => r.id);
}

export const getProductBySlug = cache(async (slug: string) => {
  const { data, error } = await db()
    .from("products")
    .select("*, brands(nome, slug), categories(nome, slug), product_variants(*), product_images(*)")
    .eq("slug", slug)
    .eq("stato", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    product_images: [...data.product_images].sort((a, b) => a.ordine - b.ordine),
    product_variants: [...data.product_variants].sort((a, b) => a.prezzo - b.prezzo || a.sku.localeCompare(b.sku)),
  };
});
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getBrandBySlug(slug: string) {
  const { data, error } = await db().from("brands").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBrands() {
  const { data, error } = await db().from("brands").select("*").order("nome");
  if (error) throw error;
  return data;
}
