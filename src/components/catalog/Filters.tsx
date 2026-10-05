import Link from "next/link";
import type { Facets } from "@/lib/catalog";
import { swatch } from "@/lib/colors";
import type { FilterParams } from "@/lib/filters";
import AutoSubmitForm from "./AutoSubmitForm";
import FiltersPanel from "./FiltersPanel";

export const FILTERS_FORM_ID = "filtri";

type Props = {
  facets: Facets;
  params: FilterParams;
  /** Parametri da conservare (es. q della ricerca). */
  hidden?: Record<string, string>;
  showMarche?: boolean;
  resetHref: string;
};

function Group({ title, name, options, selected, colors }: {
  title: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
  colors?: boolean;
}) {
  if (options.length < 2 && !selected.length) return null;
  return (
    <fieldset className="border-t border-neutral-100 pt-4">
      <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const c = colors ? swatch(o.value) : undefined;
          return (
            <label key={o.value} className="cursor-pointer">
              <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} className="peer sr-only" />
              <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm transition hover:border-neutral-400 peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sun">
                {c && <span aria-hidden className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: c }} />}
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Filters({ facets, params, hidden, showMarche = true, resetHref }: Props) {
  const attivi = params.marche.length + params.colori.length + params.misure.length + (params.min !== undefined ? 1 : 0) + (params.max !== undefined ? 1 : 0) + (params.disponibili ? 1 : 0);
  return (
    <FiltersPanel attivi={attivi}>
      <AutoSubmitForm id={FILTERS_FORM_ID} method="get" className="space-y-4 rounded-3xl bg-white p-5 text-sm shadow-sm">
        {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Filtri</h2>
          {attivi > 0 && <Link href={resetHref} className="text-xs font-semibold text-terracotta hover:underline">Azzera tutto</Link>}
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="font-medium">Solo disponibili</span>
          <input type="checkbox" name="disponibili" value="1" defaultChecked={params.disponibili} className="peer sr-only" />
          <span aria-hidden className="relative h-6 w-11 rounded-full bg-neutral-200 transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-green-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-sun" />
        </label>

        {showMarche && (
          <Group title="Marca" name="marca" selected={params.marche} options={facets.marche.map((m) => ({ value: m.slug, label: m.nome }))} />
        )}
        <Group title="Colore" name="colore" selected={params.colori} colors options={facets.colori.map((c) => ({ value: c, label: c }))} />
        <Group title="Misura / taglia" name="misura" selected={params.misure} options={facets.misure.map((m) => ({ value: m, label: m }))} />

        <fieldset className="border-t border-neutral-100 pt-4">
          <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">Prezzo</legend>
          <div className="flex items-center gap-2">
            {(["min", "max"] as const).map((k) => (
              <label key={k} className="relative flex-1">
                <span className="sr-only">Prezzo {k === "min" ? "minimo" : "massimo"}</span>
                <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                <input type="number" name={k} min={0} inputMode="numeric" placeholder={k === "min" ? "Min" : "Max"} defaultValue={params[k] ?? ""}
                  className="w-full rounded-full border border-neutral-200 py-2 pl-7 pr-3 focus:border-navy focus:outline-none" />
              </label>
            ))}
          </div>
        </fieldset>

        <noscript>
          <button type="submit" className="w-full rounded-full bg-navy py-2 font-semibold text-white">Applica</button>
        </noscript>
      </AutoSubmitForm>
    </FiltersPanel>
  );
}
