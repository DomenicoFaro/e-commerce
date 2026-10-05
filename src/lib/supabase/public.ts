import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Etichette della cache dati di Next: svuotate dall'admin a ogni salvataggio. */
export const PUBLIC_CACHE_TAGS = ["catalogo", "impostazioni"];

/**
 * Lettura dei dati pubblici senza cookie.
 * - default: risposte in cache (etichettate, aggiornate al salvataggio dall'admin o dopo 10 minuti)
 * - fresh: sempre dal database (carrello: prezzi e disponibilità attuali)
 */
export const createPublicClient = ({ fresh = false } = {}) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Variabili Supabase mancanti: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "(su Vercel: Settings → Environment Variables, poi Redeploy). Vedi DEPLOY.md.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, fresh ? { ...init, cache: "no-store" } : { ...init, next: { tags: PUBLIC_CACHE_TAGS, revalidate: 600 } }),
    },
  });
};
