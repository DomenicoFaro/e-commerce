"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { login, register, resetPassword } from "@/app/(shop)/account/actions";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

type Tab = "accedi" | "registrati" | "recupera";

export default function AuthForms({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>("accedi");
  const [loginState, loginAction] = useFormState(login, null);
  const [regState, regAction] = useFormState(register, null);
  const [resetState, resetAction] = useFormState(resetPassword, null);

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
      {tab !== "recupera" && (
        <div role="tablist" className="mb-6 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-sm font-semibold">
          {(["accedi", "registrati"] as const).map((t) => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn("rounded-full py-2", tab === t ? "bg-white shadow-sm" : "text-neutral-500")}>
              {t === "accedi" ? "Accedi" : "Crea account"}
            </button>
          ))}
        </div>
      )}

      {tab === "accedi" && (
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? ""} />
          <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
          <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
          <FormMessage state={loginState} />
          <SubmitButton className="w-full" variant="dark">Accedi</SubmitButton>
          <button type="button" onClick={() => setTab("recupera")} className="w-full text-center text-sm text-navy underline">
            Password dimenticata?
          </button>
        </form>
      )}

      {tab === "registrati" && (
        <form action={regAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome"><Input name="nome" autoComplete="given-name" required /></Field>
            <Field label="Cognome"><Input name="cognome" autoComplete="family-name" required /></Field>
          </div>
          <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
          <Field label="Password" hint="Almeno 8 caratteri"><Input name="password" type="password" autoComplete="new-password" minLength={8} required /></Field>
          <FormMessage state={regState} />
          <SubmitButton className="w-full" variant="dark">Crea account</SubmitButton>
          <p className="text-xs text-neutral-500">Creando un account accetti i Termini di vendita e confermi di aver letto l&apos;informativa Privacy.</p>
        </form>
      )}

      {tab === "recupera" && (
        <form action={resetAction} className="space-y-4">
          <h2 className="text-lg font-bold">Recupera password</h2>
          <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
          <FormMessage state={resetState} />
          <SubmitButton className="w-full" variant="dark">Invia link</SubmitButton>
          <button type="button" onClick={() => setTab("accedi")} className="w-full text-center text-sm text-navy underline">Torna all&apos;accesso</button>
        </form>
      )}
    </div>
  );
}
