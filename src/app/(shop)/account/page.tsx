import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, LogOut, Package } from "lucide-react";
import AuthForms from "@/components/account/AuthForms";
import ProfileForms from "@/components/account/ProfileForms";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Il mio account", robots: { index: false } };

type Props = { searchParams: { next?: string; errore?: string; "nuova-password"?: string } };

export default async function AccountPage({ searchParams }: Props) {
  const current = await getCurrentUser();

  if (!current) {
    return (
      <div className="py-6">
        <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight">Il tuo account</h1>
        <p className="mb-8 text-center text-neutral-600">Accedi per seguire i tuoi ordini e acquistare più velocemente.</p>
        {searchParams.errore && (
          <p role="alert" className="mx-auto mb-4 max-w-md rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Il link non è valido o è scaduto. Riprova.
          </p>
        )}
        <AuthForms next={searchParams.next} />
      </div>
    );
  }

  const { user, profile, isStaff } = current;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ciao{profile?.nome ? `, ${profile.nome}` : ""}!</h1>
          <p className="text-neutral-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isStaff && (
            <Link href="/admin" className={buttonVariants({ variant: "dark" })}><LayoutDashboard size={18} /> Pannello admin</Link>
          )}
          <Link href="/account/ordini" className={buttonVariants({ variant: "outline" })}><Package size={18} /> I miei ordini</Link>
          <form action={logout}><Button variant="ghost"><LogOut size={18} /> Esci</Button></form>
        </div>
      </div>
      <ProfileForms profile={profile} nuovaPassword={!!searchParams["nuova-password"]} />
    </div>
  );
}
