"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
    <form action="/s" role="search" className="relative order-3 flex w-full flex-1 md:order-none md:w-auto"
      onSubmit={() => setOpen(false)}>
      <label htmlFor="q" className="sr-only">Cerca nel catalogo</label>
      <select name="c" aria-label="Reparto" defaultValue="" className="hidden rounded-l-md border-0 bg-neutral-200 px-2 text-sm text-neutral-800 md:block">
        <option value="">Tutti</option>
        {departments.map((d) => <option key={d.slug} value={d.slug}>{d.nome}</option>)}
      </select>
      <input id="q" name="q" type="search" autoComplete="off" placeholder="Cerca tovaglie, lenzuola, asciugamani…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        role="combobox" aria-expanded={visible} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 && active < items.length ? `${listId}-${active}` : undefined}
        className="min-w-0 flex-1 border-0 px-3 py-2 text-neutral-900 md:rounded-none max-md:rounded-l-md" />
      <button type="submit" aria-label="Cerca" className="rounded-r-md bg-sun px-4 text-navy">
        <Search size={20} />
      </button>

      {visible && (
        <ul id={listId} role="listbox" aria-label="Suggerimenti"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md bg-white py-1 text-neutral-900 shadow-lg">
          {items.map((s, i) => (
            <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <a href={`/p/${s.slug}`}
                onMouseDown={(e) => { e.preventDefault(); setOpen(false); router.push(`/p/${s.slug}`); }}
                className={`flex items-center gap-2 px-4 py-2 ${i === active ? "bg-neutral-100" : "hover:bg-neutral-100"}`}>
                <Search size={14} className="shrink-0 text-neutral-400" aria-hidden />
                {s.titolo}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
