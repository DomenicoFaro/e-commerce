"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree, Home, LayoutDashboard, Package, Receipt, Settings, Star, Tag, TicketPercent, Users, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: LucideIcon; admin?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ordini", label: "Ordini", icon: Receipt },
  { href: "/admin/prodotti", label: "Prodotti", icon: Package },
  { href: "/admin/categorie", label: "Categorie", icon: FolderTree },
  { href: "/admin/marche", label: "Marche", icon: Tag },
  { href: "/admin/coupon", label: "Coupon", icon: TicketPercent },
  { href: "/admin/recensioni", label: "Recensioni", icon: Star },
  { href: "/admin/utenti", label: "Utenti", icon: Users, admin: true },
  { href: "/admin/impostazioni", label: "Impostazioni e pagine", icon: Settings, admin: true },
];

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.filter((i) => isAdmin || !i.admin).map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={cn("flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white")}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
      <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white lg:mt-4">
        <Home size={18} /> Vai al sito
      </Link>
    </nav>
  );
}
