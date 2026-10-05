import Link from "next/link";
import { STORE } from "@/lib/store";

export default function Footer() {
  return (
    <footer className="mt-12 bg-navy text-sm text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-bold text-white">{STORE.ragioneSociale}</p>
          <p>{STORE.indirizzo}</p>
          <p>P.IVA {STORE.piva}</p>
          <p>Tel. {STORE.telefono}</p>
          <p>{STORE.email}</p>
          <p className="mt-2">{STORE.orari}</p>
        </div>
        <nav aria-label="Informazioni" className="flex flex-col gap-1">
          <Link href="/chi-siamo">Chi siamo</Link>
          <Link href="/contatti">Contatti</Link>
          <Link href="/spedizioni-e-resi">Spedizioni e resi</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <nav aria-label="Legale" className="flex flex-col gap-1">
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
          <Link href="/termini">Termini di vendita</Link>
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">Piattaforma ODR</a>
        </nav>
      </div>
    </footer>
  );
}
