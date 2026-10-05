import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-sun text-navy hover:bg-sun/85",
        dark: "bg-navy text-white hover:bg-navy/90",
        outline: "border border-neutral-300 bg-white text-neutral-900 hover:border-navy",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-navy hover:bg-navy/5",
      },
      size: { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5", lg: "px-7 py-3.5 text-lg" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
