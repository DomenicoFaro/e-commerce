import { cn } from "@/lib/utils";

const TONES = {
  navy: "from-navy via-[#26345a] to-[#3a2f4f] text-white",
  terracotta: "from-terracotta via-[#e8906f] to-sun text-white",
  light: "from-white to-sun/20 text-neutral-900",
};

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  tone?: keyof typeof TONES;
  children?: React.ReactNode;
};

/** Intestazione colorata delle pagine elenco (categorie, offerte, marche, ricerca). */
export default function PageHero({ eyebrow, title, description, tone = "navy", children }: Props) {
  return (
    <section className={cn("relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-10 md:px-10", TONES[tone])}>
      <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="absolute -bottom-20 right-1/4 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative animate-fade-up">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] opacity-80">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base opacity-85 md:text-lg">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
