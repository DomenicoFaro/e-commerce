import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-white p-5 shadow-sm", className)} {...props} />;
}

export function Table({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>{children}</span>;
}

export function Empty({ children, href, cta }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center text-neutral-600 shadow-sm">
      <p>{children}</p>
      {href && <Link href={href} className="mt-3 inline-block font-semibold text-navy underline">{cta}</Link>}
    </div>
  );
}
