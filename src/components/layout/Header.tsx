import Link from "next/link";
import { LayoutGrid, Percent, Sparkles, User } from "lucide-react";
import Logo from "@/components/brand/Logo";
import CartBadge from "@/components/cart/CartBadge";
import { DEPARTMENTS } from "@/lib/navigation";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <SearchBox departments={DEPARTMENTS} />

          <nav aria-label="Account" className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/account" aria-label="Account e ordini" className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white/10">
              <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-white/10"><User size={18} /></span>
              <span className="hidden leading-tight lg:block">
                <span className="block text-xs text-white/60">Ciao, accedi</span>
                <span className="font-semibold">Account e ordini</span>
              </span>
            </Link>
            <CartBadge />
          </nav>
        </div>
      </div>

      <div className="border-b border-neutral-200 bg-white/95 backdrop-blur">
        <nav aria-label="Categorie" className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-2 text-sm [scrollbar-width:none]">
          <details className="group relative shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-navy px-4 py-1.5 font-semibold text-white transition hover:bg-navy/90">
              <LayoutGrid size={16} /> Categorie
            </summary>
            <ul className="fixed z-50 mt-2 grid w-[min(36rem,calc(100vw-2rem))] grid-cols-2 gap-1 rounded-2xl bg-white p-2 text-neutral-900 shadow-xl ring-1 ring-black/5">
              {DEPARTMENTS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/c/${d.slug}`} className="block rounded-xl px-3 py-2.5 hover:bg-neutral-100">{d.nome}</Link>
                </li>
              ))}
            </ul>
          </details>
          <Link href="/offerte" className="flex shrink-0 items-center gap-1.5 rounded-full bg-terracotta/10 px-4 py-1.5 font-semibold text-terracotta-dark transition hover:bg-terracotta/20">
            <Percent size={14} /> Offerte
          </Link>
          <Link href="/s?sort=novita" className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100">
            <Sparkles size={14} /> Novità
          </Link>
          <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />
          {DEPARTMENTS.slice(0, 6).map((d) => (
            <Link key={d.slug} href={`/c/${d.slug}`} className="shrink-0 rounded-full px-3 py-1.5 text-neutral-700 transition hover:bg-neutral-100 hover:text-navy">
              {d.nome}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
