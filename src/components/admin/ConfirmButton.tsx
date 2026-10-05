"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pulsante di invio che chiede conferma (per le eliminazioni). */
export default function ConfirmButton({ message, label = "Elimina", className }: { message: string; label?: string; className?: string }) {
  return (
    <button type="submit" onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
      className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50", className)}>
      <Trash2 size={16} /> {label}
    </button>
  );
}
