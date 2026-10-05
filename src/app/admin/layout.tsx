import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import AdminNav from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/admin";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin Shop House" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin } = await requireStaff();
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 lg:flex-row">
      <aside className="bg-navy p-4 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <Link href="/admin" className="mb-6 block"><Logo /></Link>
        <AdminNav isAdmin={isAdmin} />
        <p className="mt-6 hidden text-xs text-white/50 lg:block">
          {profile?.nome ?? user.email} · {profile?.ruolo}
        </p>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
