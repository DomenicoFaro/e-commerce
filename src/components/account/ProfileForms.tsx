"use client";

import { useFormState } from "react-dom";
import { updatePassword, updateProfile } from "@/app/(shop)/account/actions";
import { Field, Input } from "@/components/ui/field";
import type { Tables } from "@/types/database";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

export default function ProfileForms({ profile, nuovaPassword }: { profile: Tables<"profiles"> | null; nuovaPassword?: boolean }) {
  const [state, action] = useFormState(updateProfile, null);
  const [pwState, pwAction] = useFormState(updatePassword, null);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">I tuoi dati</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome"><Input name="nome" defaultValue={profile?.nome ?? ""} /></Field>
          <Field label="Cognome"><Input name="cognome" defaultValue={profile?.cognome ?? ""} /></Field>
        </div>
        <Field label="Telefono"><Input name="telefono" type="tel" defaultValue={profile?.telefono ?? ""} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="newsletter" defaultChecked={profile?.newsletter_consent} className="accent-navy" />
          Voglio ricevere offerte e novità via email
        </label>
        <FormMessage state={state} />
        <SubmitButton variant="dark">Salva</SubmitButton>
      </form>
      <form action={pwAction} id="password" className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">{nuovaPassword ? "Imposta la nuova password" : "Cambia password"}</h2>
        <Field label="Nuova password" hint="Almeno 8 caratteri">
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus={nuovaPassword} />
        </Field>
        <FormMessage state={pwState} />
        <SubmitButton variant="outline">Aggiorna password</SubmitButton>
      </form>
    </div>
  );
}
