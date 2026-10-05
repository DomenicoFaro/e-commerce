import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:border-navy focus:outline-none";

type FieldProps = { label: string; hint?: string; className?: string; children: React.ReactNode };

/** Etichetta + controllo + suggerimento facoltativo. */
export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("block space-y-1 text-sm", className)}>
      <span className="font-medium text-neutral-800">{label}</span>
      {children}
      {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-24", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClass, className)} {...props} />;
}
