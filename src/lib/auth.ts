import { createClient } from "@/lib/supabase/server";

/** Utente collegato e profilo (null se non ha fatto l'accesso). */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user, profile, isStaff: profile?.ruolo === "staff" || profile?.ruolo === "admin", isAdmin: profile?.ruolo === "admin" };
}
