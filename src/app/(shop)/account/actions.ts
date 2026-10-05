"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | null;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

const tradotto = (msg: string) =>
  ({
    "Invalid login credentials": "Email o password non corretti.",
    "Email not confirmed": "Devi prima confermare l'email: controlla la posta (anche lo spam).",
    "User already registered": "Esiste già un account con questa email: accedi.",
  })[msg] ?? msg;

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await createClient().auth.signInWithPassword({ email: text(form, "email"), password: text(form, "password") });
  if (error) return { error: tradotto(error.message) };
  revalidatePath("/", "layout");
  const next = text(form, "next");
  redirect(next.startsWith("/") ? next : "/account");
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const password = text(form, "password");
  if (password.length < 8) return { error: "La password deve avere almeno 8 caratteri." };
  const { data, error } = await createClient().auth.signUp({
    email: text(form, "email"),
    password,
    options: {
      emailRedirectTo: `${SITE}/auth/callback?next=/account`,
      data: { nome: text(form, "nome"), cognome: text(form, "cognome") },
    },
  });
  if (error) return { error: tradotto(error.message) };
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }
  return { message: "Ti abbiamo inviato un'email: clicca il link per confermare l'account, poi accedi." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await createClient().auth.resetPasswordForEmail(text(form, "email"), {
    redirectTo: `${SITE}/auth/callback?next=/account?nuova-password=1`,
  });
  if (error) return { error: tradotto(error.message) };
  return { message: "Se l'email è registrata riceverai un link per impostare una nuova password." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = text(form, "password");
  if (password.length < 8) return { error: "La password deve avere almeno 8 caratteri." };
  const { error } = await createClient().auth.updateUser({ password });
  if (error) return { error: tradotto(error.message) };
  return { message: "Password aggiornata." };
}

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const { error } = await supabase
    .from("profiles")
    .update({
      nome: text(form, "nome") || null,
      cognome: text(form, "cognome") || null,
      telefono: text(form, "telefono") || null,
      newsletter_consent: form.get("newsletter") === "on",
    })
    .eq("id", user.id);
  if (error) return { error: "Non è stato possibile salvare. Riprova." };
  revalidatePath("/account");
  return { message: "Dati salvati." };
}

export async function logout() {
  await createClient().auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
