import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { SORTS, type Facets } from "@/lib/catalog";
import type { FilterParams } from "@/lib/filters";
import AutoSubmitForm from "./AutoSubmitForm";

type Props = {
  facets: Facets;
  params: FilterParams;
  /** Parametri da conservare (es. q della ricerca). */
  hidden?: Record<string, string>;
  showMarche?: boolean;
  showRilevanza?: boolean;
  resetHref: string;
  totale: number;
};

function Group({ title, name, options, selected }: {
  title: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
}) {
  if (options.length < 2 && !selected.length) return null;
  return (
    <fieldset className="border-t border-neutral-200 pt-3">
      <legend className="mb-1 font-semibold">{title}</legend>
      <ul className="max-h-48 space-y-1 overflow-y-auto">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} className="accent-navy" />
              {o.label}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export default function Filters({ facets, params, hidden, showMarche = true, showRilevanza, resetHref, totale }: Props) {
  const sorts = Object.entries(SORTS).filter(([k]) => showRilevanza || k !== "rilevanza");
  return (
    <AutoSubmitForm method="get" className="space-y-3 text-sm">
      {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

      <div className="flex items-center justify-between gap-2">
        <p className="text-neutral-600">{totale === 1 ? "1 prodotto" : `${totale} prodotti`}</p>
        <label className="flex items-center gap-2">
          <span className="sr-only md:not-sr-only">Ordina per</span>
          <select name="sort" defaultValue={params.sort ?? ""} className="rounded border border-neutral-300 bg-white px-2 py-1">
            <option value="">{showRilevanza ? SORTS.rilevanza : SORTS.novita}</option>
            {sorts.filter(([k]) => k !== (showRilevanza ? "rilevanza" : "novita")).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <details className="rounded-lg bg-white p-4 shadow-sm md:open:block" open>
        <summary className="flex cursor-pointer items-center gap-2 font-semibold md:hidden">
          <SlidersHorizontal size={16} /> Filtri
        </summary>
        <div className="mt-3 space-y-3 md:mt-0">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" name="disponibili" value="1" defaultChecked={params.disponibili} className="accent-navy" />
            Solo disponibili
          </label>
          {showMarche && (
            <Group title="Marca" name="marca" selected={params.marche}
              options={facets.marche.map((m) => ({ value: m.slug, label: m.nome }))} />
          )}
          <Group title="Colore" name="colore" selected={params.colori} options={facets.colori.map((c) => ({ value: c, label: c }))} />
          <Group title="Misura / taglia" name="misura" selected={params.misure} options={facets.misure.map((m) => ({ value: m, label: m }))} />
          <fieldset className="border-t border-neutral-200 pt-3">
            <legend className="mb-1 font-semibold">Prezzo (€)</legend>
            <div className="flex items-center gap-2">
              <input type="number" name="min" min={0} inputMode="numeric" placeholder="Min" defaultValue={params.min ?? ""}
                aria-label="Prezzo minimo" className="w-20 rounded border border-neutral-300 px-2 py-1" />
              <span aria-hidden>–</span>
              <input type="number" name="max" min={0} inputMode="numeric" placeholder="Max" defaultValue={params.max ?? ""}
                aria-label="Prezzo massimo" className="w-20 rounded border border-neutral-300 px-2 py-1" />
            </div>
          </fieldset>
          <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
            <button type="submit" className="rounded bg-navy px-3 py-1.5 font-semibold text-white">Applica</button>
            <Link href={resetHref} className="text-navy underline">Azzera filtri</Link>
          </div>
        </div>
      </details>
    </AutoSubmitForm>
  );
}
