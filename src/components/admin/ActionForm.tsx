"use client";

import { useFormState } from "react-dom";
import type { AdminState } from "@/app/admin/actions";
import FormMessage from "@/components/account/FormMessage";

type Props = {
  action: (state: AdminState, form: FormData) => Promise<AdminState>;
  className?: string;
  children: React.ReactNode;
};

/** Form con esito (errore / salvato) mostrato sotto. */
export default function ActionForm({ action, className, children }: Props) {
  const [state, formAction] = useFormState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      {state && <div className="mt-2 basis-full"><FormMessage state={state} /></div>}
    </form>
  );
}
