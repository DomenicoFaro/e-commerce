import Link from "next/link";
import { DEPARTMENTS } from "@/lib/navigation";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-navy p-8 text-white">
        <h1 className="text-3xl font-bold">Shop House Giarre</h1>
        <p className="mt-2 max-w-xl text-white/80">
          Casalinghi, tessile casa, intimo e cura persona dei migliori marchi. {/* TODO: testo hero e offerte reali dal negozio */}
        </p>
      </section>
      <section aria-labelledby="reparti">
        <h2 id="reparti" className="mb-3 text-xl font-bold">Acquista per reparto</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DEPARTMENTS.slice(0, 4).map((d) => (
            <Link key={d.slug} href={`/c/${d.slug}`} className="rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-3 flex aspect-square items-center justify-center rounded bg-neutral-100 text-neutral-400">
                <span aria-hidden>🛏️</span>
              </div>
              <span className="font-semibold">{d.nome}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg bg-sun/30 p-6 text-center font-semibold">
        Ritiro gratuito in negozio a Giarre — Via Fratelli Cairoli 109
      </section>
    </div>
  );
}
