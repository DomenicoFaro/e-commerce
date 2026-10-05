import Link from "next/link";
import { Menu, User } from "lucide-react";
import Logo from "@/components/brand/Logo";
import CartBadge from "@/components/cart/CartBadge";
import { DEPARTMENTS, QUICK_LINKS } from "@/lib/navigation";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 text-white shadow-md">
      <div className="bg-navy">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/" aria-label="Shop House Giarre — home">
            <Logo />
          </Link>

          <SearchBox departments={DEPARTMENTS} />

          <nav aria-label="Account" className="ml-auto flex items-center gap-5 text-sm">
            <Link href="/account" className="flex items-center gap-1.5 hover:text-sun">
              <User size={20} />
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs text-white/70">Ciao, accedi</span>
                <span className="font-semibold">Account e ordini</span>
              </span>
            </Link>
            <CartBadge />
          </nav>
        </div>
      </div>

      <div className="bg-[#18223a] text-sm">
        <nav aria-label="Categorie" className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-2">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 font-semibold hover:text-sun">
              <Menu size={18} /> Tutte le categorie
            </summary>
            <ul className="fixed mt-2 w-64 rounded-xl bg-white py-2 text-neutral-900 shadow-xl">
              {DEPARTMENTS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/c/${d.slug}`} className="block px-4 py-2 hover:bg-neutral-100">{d.nome}</Link>
                </li>
              ))}
            </ul>
          </details>
          {QUICK_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-sun">{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
