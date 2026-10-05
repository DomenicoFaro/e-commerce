import { createServerClient } from "@supabase/ssr";
import "server-only";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createClient() {
  const store = cookies();
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* chiamato da Server Component: la sessione è aggiornata dal middleware */
        }
      },
    },
  });
}

/** Solo lato server (webhook, ordini): bypassa la RLS. Mai importare nel client. */
export const createServiceClient = () =>
  createAdminClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
