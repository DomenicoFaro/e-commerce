import { cn } from "@/lib/utils";

/** Logo provvisorio (casetta + scritta). TODO: sostituire con il logo ufficiale del negozio. */
export default function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#E07A5F" />
        <path d="M9 19.5 20 10l11 9.5V30a1 1 0 0 1-1 1h-7v-7h-6v7h-7a1 1 0 0 1-1-1z" fill="#F5F5F2" />
        <circle cx="29" cy="11" r="3.2" fill="#F2C14E" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn("text-lg font-extrabold tracking-tight", inverted ? "text-navy" : "text-white")}>Shop House</span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.3em]", inverted ? "text-terracotta-dark" : "text-sun")}>Giarre</span>
      </span>
    </span>
  );
}
