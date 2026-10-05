import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Lettura del catalogo pubblico senza cookie: le pagine restano in cache (ISR). */
export const createPublicClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
