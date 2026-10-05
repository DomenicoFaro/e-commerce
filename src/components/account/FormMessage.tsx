import type { FormState } from "@/app/(shop)/account/actions";

export default function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  return state.error ? (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
  ) : state.message ? (
    <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{state.message}</p>
  ) : null;
}
