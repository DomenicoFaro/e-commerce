"use client";

import type { ComponentProps } from "react";

/** Form GET che si invia a ogni modifica; senza JavaScript resta il pulsante "Applica". */
export default function AutoSubmitForm(props: ComponentProps<"form">) {
  return <form {...props} onChange={(e) => e.currentTarget.requestSubmit()} />;
}
