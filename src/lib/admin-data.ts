import type { Tables } from "@/types/database";

/** Categorie in ordine ad albero, con la profondità per l'indentazione nei menu. */
export function categoryTree(all: Tables<"categories">[]) {
  const out: (Tables<"categories"> & { depth: number })[] = [];
  const walk = (parent: string | null, depth: number) =>
    all
      .filter((c) => c.parent_id === parent)
      .sort((a, b) => a.ordine - b.ordine || a.nome.localeCompare(b.nome, "it"))
      .forEach((c) => { out.push({ ...c, depth }); walk(c.id, depth + 1); });
  walk(null, 0);
  return out;
}
