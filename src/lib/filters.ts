import { SORTS, type ListFilters, type Sort } from "@/lib/catalog";

export type SearchParams = Record<string, string | string[] | undefined>;

/** Filtri come arrivano dall'URL (prezzi in euro). */
export type FilterParams = {
  marche: string[];
  colori: string[];
  misure: string[];
  min?: number;
  max?: number;
  disponibili: boolean;
  sort?: Sort;
};

const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const euro = (v: string | string[] | undefined) => {
  const n = Number(first(v)?.replace(",", "."));
  return first(v) && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseFilters(sp: SearchParams): FilterParams {
  const sort = first(sp.sort);
  return {
    marche: list(sp.marca),
    colori: list(sp.colore),
    misure: list(sp.misura),
    min: euro(sp.min),
    max: euro(sp.max),
    disponibili: first(sp.disponibili) === "1",
    sort: sort && sort in SORTS ? (sort as Sort) : undefined,
  };
}

export const toListFilters = (p: FilterParams): ListFilters => ({
  marche: p.marche,
  colori: p.colori,
  misure: p.misure,
  prezzoMin: p.min === undefined ? undefined : Math.round(p.min * 100),
  prezzoMax: p.max === undefined ? undefined : Math.round(p.max * 100),
  disponibili: p.disponibili,
  sort: p.sort,
});

export const firstParam = first;
