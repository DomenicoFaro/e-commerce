import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Unisce classi Tailwind risolvendo i conflitti (convenzione shadcn/ui). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
