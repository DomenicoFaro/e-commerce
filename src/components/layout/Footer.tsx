import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { getNegozio, PAGINE } from "@/lib/settings";

const INFO = ["chi-siamo", "contatti", "spedizioni-e-resi", "faq"] as const;
const LEGALI = ["privacy", "cookie", "termini"] as const;

export default async function Footer() {
  const n = await getNegozio();
  return (
    <footer className="mt-16 bg-navy text-sm text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <ul className="space-y-2">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-sun" />{n.indirizzo}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-sun" /><a href={`tel:${n.telefono.replace(/\s/g, "")}`} className="hover:text-white">{n.telefono}</a></li>
            {n.email && <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-sun" /><a href={`mailto:${n.email}`} className="hover:text-white">{n.email}</a></li>}
            <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-sun" />{n.orari_testo}</li>
          </ul>
        </div>
        <nav aria-label="Informazioni" className="flex flex-col gap-2">
          <p className="font-semibold text-white">Informazioni</p>
          {INFO.map((s) => <Link key={s} href={`/${s}`} className="hover:text-white">{PAGINE[s]}</Link>)}
        </nav>
        <nav aria-label="Legale" className="flex flex-col gap-2">
          <p className="font-semibold text-white">Legale</p>
          {LEGALI.map((s) => <Link key={s} href={`/${s}`} className="hover:text-white">{PAGINE[s]}</Link>)}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="hover:text-white">Piattaforma ODR</a>
        </nav>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} {n.ragione_sociale} · P.IVA {n.piva}
      </p>
    </footer>
  );
}
