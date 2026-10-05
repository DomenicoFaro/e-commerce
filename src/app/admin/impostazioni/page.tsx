import { saveHome, saveNegozio, savePagina, saveSpedizione } from "@/app/admin/actions";
import ActionForm from "@/components/admin/ActionForm";
import { Card, PageHeader } from "@/components/admin/ui";
import SubmitButton from "@/components/account/SubmitButton";
import { Field, Input, Textarea } from "@/components/ui/field";
import { centsToEuro, requireAdmin } from "@/lib/admin";
import { getHome, getNegozio, getPagina, getSpedizione, PAGINE, type PaginaSlug } from "@/lib/settings";

export const metadata = { title: "Impostazioni e pagine" };

const NEGOZIO_FIELDS = [
  ["ragione_sociale", "Ragione sociale"], ["piva", "Partita IVA"], ["indirizzo", "Indirizzo"], ["telefono", "Telefono"],
  ["email", "Email"], ["whatsapp", "WhatsApp"], ["orari_testo", "Orari (come appaiono sul sito)"],
] as const;

export default async function AdminSettings() {
  await requireAdmin();
  const slugs = Object.keys(PAGINE) as PaginaSlug[];
  const [negozio, home, sped, pagine] = await Promise.all([
    getNegozio(), getHome(), getSpedizione(), Promise.all(slugs.map(getPagina)),
  ]);

  return (
    <>
      <PageHeader title="Impostazioni e pagine" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold">Home page</h2>
          <ActionForm action={saveHome} className="space-y-3">
            <Field label="Titolo grande"><Input name="titolo" defaultValue={home.titolo} /></Field>
            <Field label="Sottotitolo"><Textarea name="sottotitolo" defaultValue={home.sottotitolo} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Testo pulsante"><Input name="cta_testo" defaultValue={home.cta_testo} /></Field>
              <Field label="Link pulsante" hint="Es. /offerte o /c/bagno"><Input name="cta_link" defaultValue={home.cta_link} /></Field>
            </div>
            <SubmitButton variant="dark">Salva home</SubmitButton>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">Spedizione</h2>
          <ActionForm action={saveSpedizione} className="space-y-3">
            <Field label="Costo spedizione (€)" hint="Vuoto = calcolato al pagamento">
              <Input name="costo" inputMode="decimal" defaultValue={centsToEuro(sped.costo)} placeholder="es. 6,90" />
            </Field>
            <Field label="Spedizione gratuita sopra (€)" hint="Vuoto = mai gratuita">
              <Input name="soglia" inputMode="decimal" defaultValue={centsToEuro(sped.soglia)} placeholder="es. 59,00" />
            </Field>
            <SubmitButton variant="dark">Salva spedizione</SubmitButton>
          </ActionForm>
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-bold">Dati del negozio</h2>
          <ActionForm action={saveNegozio} className="grid gap-3 md:grid-cols-2">
            {NEGOZIO_FIELDS.map(([k, label]) => (
              <Field key={k} label={label} className={k === "orari_testo" ? "md:col-span-2" : undefined}>
                <Input name={k} defaultValue={negozio[k]} />
              </Field>
            ))}
            <div><SubmitButton variant="dark">Salva dati negozio</SubmitButton></div>
          </ActionForm>
        </Card>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Pagine del sito</h2>
      <p className="mb-4 text-sm text-neutral-600">
        Scrivi il testo normalmente. Lascia una riga vuota tra i paragrafi e inizia una riga con <code>## </code> per un sottotitolo.
      </p>
      <div className="space-y-3">
        {slugs.map((slug, i) => (
          <details key={slug} className="rounded-2xl bg-white shadow-sm">
            <summary className="cursor-pointer p-5 font-semibold">{pagine[i].titolo} <span className="font-normal text-neutral-500">/{slug}</span></summary>
            <ActionForm action={savePagina} className="space-y-3 px-5 pb-5">
              <input type="hidden" name="slug" value={slug} />
              <Field label="Titolo"><Input name="titolo" defaultValue={pagine[i].titolo} /></Field>
              <Field label="Testo"><Textarea name="testo" defaultValue={pagine[i].testo} rows={12} className="font-mono text-sm" /></Field>
              <SubmitButton variant="dark">Salva pagina</SubmitButton>
            </ActionForm>
          </details>
        ))}
      </div>
    </>
  );
}
