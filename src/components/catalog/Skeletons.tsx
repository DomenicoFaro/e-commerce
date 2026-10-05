const bar = "animate-shimmer rounded-full bg-[linear-gradient(90deg,#ececea_25%,#f7f7f5_50%,#ececea_75%)] bg-[length:200%_100%]";
const box = bar.replace("rounded-full", "rounded-3xl");

/** Scheletro mostrato subito mentre si carica una pagina elenco. */
export function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Caricamento">
      <div className={`mb-8 h-44 ${box}`} />
      <div className="grid gap-6 md:grid-cols-[16rem_1fr] lg:grid-cols-[17rem_1fr]">
        <div className={`hidden h-96 md:block ${box}`} />
        <div>
          <div className={`mb-5 h-9 w-48 ${bar}`} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl bg-white">
                <div className={`aspect-square ${box} rounded-none`} />
                <div className="space-y-2 p-4">
                  <div className={`h-3 w-1/3 ${bar}`} />
                  <div className={`h-4 w-4/5 ${bar}`} />
                  <div className={`h-5 w-1/3 ${bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Scheletro della pagina prodotto. */
export function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Caricamento" className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <div className={`aspect-square rounded-[2rem] ${box}`} />
      <div className="space-y-5">
        <div className={`h-4 w-24 ${bar}`} />
        <div className={`h-10 w-4/5 ${bar}`} />
        <div className={`h-10 w-40 ${bar}`} />
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className={`h-4 w-3/4 ${bar}`} />)}</div>
        <div className="flex gap-2">{[1, 2, 3].map((i) => <div key={i} className={`h-10 w-24 ${bar}`} />)}</div>
        <div className={`h-36 ${box}`} />
      </div>
    </div>
  );
}
