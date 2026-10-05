import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import RichText from "@/components/RichText";
import { getNegozio, getPagina, PAGINE, type PaginaSlug } from "@/lib/settings";

export const revalidate = 600;
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PAGINE).map((pagina) => ({ pagina }));

type Props = { params: { pagina: string } };
const isPagina = (s: string): s is PaginaSlug => s in PAGINE;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isPagina(params.pagina)) return {};
  const p = await getPagina(params.pagina);
  return { title: p.titolo, alternates: { canonical: `/${params.pagina}` } };
}

export default async function InfoPage({ params }: Props) {
  if (!isPagina(params.pagina)) notFound();
  const [pagina, negozio] = await Promise.all([getPagina(params.pagina), getNegozio()]);

  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ label: pagina.titolo }]} />
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{pagina.titolo}</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <RichText text={pagina.testo} />
      </div>

      {params.pagina === "contatti" && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          <li className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"><MapPin className="shrink-0 text-terracotta-dark" />{negozio.indirizzo}</li>
          <li className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"><Clock className="shrink-0 text-terracotta-dark" />{negozio.orari_testo}</li>
          <li className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <Phone className="shrink-0 text-terracotta-dark" /><a href={`tel:${negozio.telefono.replace(/\s/g, "")}`} className="font-semibold hover:underline">{negozio.telefono}</a>
          </li>
          {negozio.email && (
            <li className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <Mail className="shrink-0 text-terracotta-dark" /><a href={`mailto:${negozio.email}`} className="font-semibold hover:underline">{negozio.email}</a>
            </li>
          )}
          {negozio.whatsapp && (
            <li className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <MessageCircle className="shrink-0 text-terracotta-dark" />
              <a href={`https://wa.me/${negozio.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">WhatsApp {negozio.whatsapp}</a>
            </li>
          )}
        </ul>
      )}
    </article>
  );
}
