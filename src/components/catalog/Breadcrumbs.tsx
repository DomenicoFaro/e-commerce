import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Percorso" className="mb-4 text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/" className="hover:underline">Home</Link></li>
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-1">
            <ChevronRight size={14} aria-hidden />
            {it.href ? <Link href={it.href} className="hover:underline">{it.label}</Link> : <span aria-current="page" className="text-neutral-900">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
