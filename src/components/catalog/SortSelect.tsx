"use client";

import { ArrowUpDown } from "lucide-react";
import { SORTS, type Sort } from "@/lib/sorts";

/** Ordinamento collegato al form dei filtri (attributo form), inviato a ogni cambio. */
export default function SortSelect({ value, formId, showRilevanza }: { value?: Sort; formId: string; showRilevanza?: boolean }) {
  const def = showRilevanza ? "rilevanza" : "novita";
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Ordina per</span>
      <ArrowUpDown size={16} aria-hidden className="pointer-events-none absolute left-3 text-neutral-500" />
      <select name="sort" form={formId} defaultValue={value && value !== def ? value : ""}
        onChange={() => (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit()}
        className="cursor-pointer appearance-none rounded-full border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm font-medium shadow-sm hover:border-neutral-400 focus:border-navy focus:outline-none">
        <option value="">{SORTS[def]}</option>
        {(Object.keys(SORTS) as Sort[]).filter((k) => k !== def && (showRilevanza || k !== "rilevanza")).map((k) => (
          <option key={k} value={k}>{SORTS[k]}</option>
        ))}
      </select>
    </label>
  );
}
