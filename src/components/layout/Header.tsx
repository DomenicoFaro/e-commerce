import Link from "next/link";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { DEPARTMENTS, QUICK_LINKS } from "@/lib/navigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 text-white">
      <div className="bg-navy">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Shop House {/* TODO: logo ad alta risoluzione */}
          </Link>

          <form action="/s" role="search" className="order-3 flex w-full flex-1 md:order-none md:w-auto">
            <label htmlFor="q" className="sr-only">Cerca nel catalogo</label>
            <select name="c" aria-label="Reparto" defaultValue="" className="hidden rounded-l-md border-0 bg-neutral-200 px-2 text-sm text-neutral-800 md:block">
              <option value="">Tutti</option>
              {DEPARTMENTS.map((d) => <option key={d.slug} value={d.slug}>{d.nome}</option>)}
            </select>
            <input id="q" name="q" type="search" autoComplete="off" placeholder="Cerca tovaglie, lenzuola, asciugamani…"
              className="min-w-0 flex-1 border-0 px-3 py-2 text-neutral-900 md:rounded-none max-md:rounded-l-md" />
            <button type="submit" aria-label="Cerca" className="rounded-r-md bg-sun px-4 text-navy">
              <Search size={20} />
            </button>
          </form>

          <nav aria-label="Account" className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/account" className="flex items-center gap-1"><User size={18} /><span className="hidden sm:inline">Accedi / Il mio account</span></Link>
            <Link href="/account/ordini" className="hidden sm:inline">Ordini</Link>
            <Link href="/carrello" aria-label="Carrello" className="relative flex items-center">
              <ShoppingCart size={22} />
              <span className="absolute -right-2 -top-2 rounded-full bg-terracotta px-1.5 text-xs font-bold">0</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="bg-navy/90 text-sm">
        <nav aria-label="Categorie" className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 whitespace-nowrap">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 font-semibold"><Menu size={18} /> Tutte le categorie</summary>
            <ul className="absolute left-0 top-8 w-64 rounded-md bg-white py-2 text-neutral-900 shadow-lg">
              {DEPARTMENTS.map((d) => (
                <li key={d.slug}><Link href={`/c/${d.slug}`} className="block px-4 py-2 hover:bg-neutral-100">{d.nome}</Link></li>
              ))}
            </ul>
          </details>
          {QUICK_LINKS.map((l) => <Link key={l.label} href={l.href} className="hover:underline">{l.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
