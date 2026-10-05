import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Client Supabase dell'utente staff collegato. Le scritture passano dalla RLS (is_staff / is_admin). */
export async function requireStaff() {
  const current = await getCurrentUser();
  if (!current?.isStaff) redirect("/account?next=/admin");
  return { supabase: createClient(), ...current };
}

export async function requireAdmin() {
  const ctx = await requireStaff();
  if (!ctx.isAdmin) redirect("/admin");
  return ctx;
}

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "49,90" o "49.90" → 4990 centesimi; vuoto → null. */
export function euroToCents(v: FormDataEntryValue | string | null | undefined): number | null {
  const s = String(v ?? "").trim().replace(/\s|€/g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

export const centsToEuro = (c: number | null | undefined) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));

export const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const fieldOrNull = (f: FormData, k: string) => field(f, k) || null;
