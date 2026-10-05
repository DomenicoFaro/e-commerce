import Link from "next/link";
import { X } from "lucide-react";
import type { Sort } from "@/lib/catalog";
import type { SearchParams } from "@/lib/filters";
import { FILTERS_FORM_ID } from "./Filters";
import SortSelect from "./SortSelect";

type Props = {
  filters: React.ReactNode;
  children: React.ReactNode;
  totale: number;
  basePath: string;
  searchParams: SearchParams;
  sort?: Sort;
  showRilevanza?: boolean;
  /** Nomi leggibili per i valori dei filtri (es. slug marca → nome). */
  labels?: Record<string, string>;
};

const FILTER_KEYS: Record<string, string> = { marca: "", colore: "", misura: "", min: "da € ", max: "fino a € ", disponibili: "" };

/** Filtri a sinistra, barra con risultati / filtri attivi / ordinamento e griglia a destra. */
export default function CatalogLayout({ filters, children, totale, basePath, searchParams, sort, showRilevanza, labels = {} }: Props) {
  const chips: { label: string; href: string }[] = [];
  for (const [key, prefix] of Object.entries(FILTER_KEYS)) {
    const raw = searchParams[key];
    const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
    for (const v of values.filter(Boolean)) {
      const next = new URLSearchParams();
      for (const [k, val] of Object.entries(searchParams)) {
        for (const x of val === undefined ? [] : Array.isArray(val) ? val : [val]) {
          if (!(k === key && x === v)) next.append(k, x);
        }
      }
      const qs = next.toString();
      chips.push({ label: key === "disponibili" ? "Solo disponibili" : `${prefix}${labels[v] ?? v}`, href: qs ? `${basePath}?${qs}` : basePath });
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr] lg:grid-cols-[17rem_1fr]">
      <aside aria-label="Filtri" className="md:sticky md:top-36 md:self-start">{filters}</aside>
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p className="text-sm text-neutral-600"><span className="font-bold text-neutral-900">{totale}</span> {totale === 1 ? "prodotto" : "prodotti"}</p>
          <ul className="flex flex-1 flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.href + c.label} className="animate-scale-in">
                <Link href={c.href} scroll={false} className="flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy transition hover:bg-navy hover:text-white">
                  {c.label} <X size={12} aria-label="rimuovi" />
                </Link>
              </li>
            ))}
          </ul>
          <SortSelect value={sort} formId={FILTERS_FORM_ID} showRilevanza={showRilevanza} />
        </div>
        {children}
      </div>
    </div>
  );
}
