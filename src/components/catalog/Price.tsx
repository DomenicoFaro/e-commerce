import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = { prezzo: number; prezzoBarrato?: number | null; da?: boolean; className?: string };

/** Prezzo IVA inclusa, con prezzo barrato e percentuale di sconto se presenti. */
export default function Price({ prezzo, prezzoBarrato, da, className }: Props) {
  const sconto = prezzoBarrato ? Math.round((1 - prezzo / prezzoBarrato) * 100) : 0;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      {sconto > 0 && <span className="rounded bg-terracotta px-1.5 text-xs font-bold text-white">-{sconto}%</span>}
      <span className="font-bold">
        {da && <span className="text-sm font-normal text-neutral-600">da </span>}
        {formatPrice(prezzo)}
      </span>
      {prezzoBarrato && (
        <s className="text-sm text-neutral-500">
          <span className="sr-only">Prezzo precedente </span>
          {formatPrice(prezzoBarrato)}
        </s>
      )}
    </p>
  );
}
