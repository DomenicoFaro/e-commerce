import { setUserRole } from "@/app/admin/actions";
import { Badge, PageHeader, Table, Td } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Utenti" };

const RUOLI = { customer: "Cliente", staff: "Staff (gestisce catalogo e ordini)", admin: "Admin (tutto)" } as const;

export default async function AdminUsers() {
  const { supabase, user: me } = await requireAdmin();
  // Le email stanno in auth.users: lettura con service role, solo dopo il controllo admin
  const [{ data: profiles }, { data: auth }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    createServiceClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emails = new Map(auth?.users.map((u) => [u.id, u.email]) ?? []);

  return (
    <>
      <PageHeader title="Utenti" />
      <Table head={["Utente", "Registrato", "Newsletter", "Ruolo"]}>
        {(profiles ?? []).map((p) => (
          <tr key={p.id}>
            <Td>
              <p className="font-semibold">{[p.nome, p.cognome].filter(Boolean).join(" ") || "—"}</p>
              <p className="text-xs text-neutral-500">{emails.get(p.id)}</p>
            </Td>
            <Td>{new Date(p.created_at).toLocaleDateString("it-IT")}</Td>
            <Td>{p.newsletter_consent ? <Badge className="bg-green-100 text-green-800">Sì</Badge> : "No"}</Td>
            <Td>
              {p.id === me.id ? (
                <Badge className="bg-navy text-white">{RUOLI[p.ruolo]} (tu)</Badge>
              ) : (
                <form action={setUserRole} className="flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <Select name="ruolo" defaultValue={p.ruolo} className="w-auto py-1 text-sm">
                    {Object.entries(RUOLI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                  <Button size="sm" variant="outline">Salva</Button>
                </form>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
