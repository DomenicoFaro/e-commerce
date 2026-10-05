"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Su mobile i filtri si aprono con un pulsante; da tablet in su sono sempre visibili. */
export default function FiltersPanel({ attivi, children }: { attivi: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-semibold shadow-sm md:hidden">
        {open ? <X size={18} /> : <SlidersHorizontal size={18} />}
        {open ? "Chiudi filtri" : "Filtri"}
        {attivi > 0 && <span className="rounded-full bg-navy px-2 text-xs text-white">{attivi}</span>}
      </button>
      <div className={cn("md:block", open ? "block animate-fade-up" : "hidden")}>{children}</div>
    </>
  );
}
