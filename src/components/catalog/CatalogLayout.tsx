import type { ReactNode } from "react";

/** Filtri a sinistra (sopra su mobile) e griglia a destra. */
export default function CatalogLayout({ filters, children }: { filters: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <aside aria-label="Filtri e ordinamento">{filters}</aside>
      <div>{children}</div>
    </div>
  );
}
