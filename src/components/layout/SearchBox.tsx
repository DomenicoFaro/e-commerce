"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Suggestion = { id: string; titolo: string; slug: string };
type Props = { departments: readonly { nome: string; slug: string }[] };

/** Ricerca con autocompletamento: suggerimenti da search_products mentre si scrive. */
export default function SearchBox({ departments }: Props) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const lastRequest = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const id = ++lastRequest.current;
    const t = setTimeout(async () => {
      const { data } = await createClient().rpc("search_products", { q: term, max_results: 6 });
      if (id !== lastRequest.current) return; // risposta superata da una digitazione successiva
      setItems(data ?? []);
      setActive(-1);
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  const visible = open && items.length > 0;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      // -1 = nessun suggerimento evidenziato (Invio cerca il testo digitato)
      setActive((a) => {
        const n = a + step;
        return n < -1 ? items.length - 1 : n >= items.length ? -1 : n;
      });
    } else if (e.key === "Enter" && active >= 0 && active < items.length) {
      e.preventDefault();
      setOpen(false);
      router.push(`/p/${items[active].slug}`);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <form action="/s" role="search" onSubmit={() => setOpen(false)}
      className="group relative order-3 flex h-12 w-full flex-1 items-center rounded-full bg-white pl-1.5 pr-1.5 shadow-sm ring-2 ring-transparent transition focus-within:ring-sun md:order-none md:w-auto md:max-w-2xl">
      <label htmlFor="q" className="sr-only">Cerca nel catalogo</label>
      <div className="relative hidden md:block">
        <select name="c" aria-label="Reparto" defaultValue=""
          className="h-9 cursor-pointer appearance-none rounded-full bg-neutral-100 py-0 pl-4 pr-8 text-sm font-medium text-neutral-700 hover:bg-neutral-200 focus:outline-none">
          <option value="">Tutti i reparti</option>
          {departments.map((d) => <option key={d.slug} value={d.slug}>{d.nome}</option>)}
        </select>
        <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
      </div>
      <Search size={18} aria-hidden className="ml-3 shrink-0 text-neutral-400" />
      <input id="q" name="q" type="search" autoComplete="off" placeholder="Cerca tovaglie, lenzuola, asciugamani…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        role="combobox" aria-expanded={visible} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 && active < items.length ? `${listId}-${active}` : undefined}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden" />
      <button type="submit"
        className="flex h-9 items-center gap-2 rounded-full bg-terracotta px-4 text-sm font-semibold text-white transition hover:bg-terracotta/90">
        <Search size={16} aria-hidden /><span className="hidden sm:inline">Cerca</span><span className="sr-only sm:hidden">Cerca</span>
      </button>

      {visible && (
        <ul id={listId} role="listbox" aria-label="Suggerimenti"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white p-2 text-neutral-900 shadow-xl ring-1 ring-black/5">
          <li role="presentation" className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Prodotti</li>
          {items.map((s, i) => (
            <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <a href={`/p/${s.slug}`}
                onMouseDown={(e) => { e.preventDefault(); setOpen(false); router.push(`/p/${s.slug}`); }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-sun/20" : "hover:bg-neutral-100"}`}>
                <Search size={14} className="shrink-0 text-neutral-400" aria-hidden />
                <span className="flex-1 truncate">{s.titolo}</span>
                <ArrowUpRight size={14} className="shrink-0 text-neutral-300" aria-hidden />
              </a>
            </li>
          ))}
          <li role="presentation" className="mt-1 border-t border-neutral-100 pt-1">
            <button type="submit" className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-navy hover:bg-neutral-100">
              Vedi tutti i risultati per “{q.trim()}”
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}
