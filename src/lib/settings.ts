import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { STORE } from "@/lib/store";
import type { Json } from "@/types/database";

// Impostazioni modificabili dall'admin (tabella settings), con valori predefiniti se mancano.

export type Negozio = {
  ragione_sociale: string;
  piva: string;
  indirizzo: string;
  telefono: string;
  email: string;
  whatsapp: string;
  orari_testo: string;
};

export type Home = { titolo: string; sottotitolo: string; cta_testo: string; cta_link: string };

export type Spedizione = { costo: number | null; soglia: number | null }; // centesimi

export type Pagina = { titolo: string; testo: string };

export const PAGINE = {
  "chi-siamo": "Chi siamo",
  contatti: "Contatti",
  "spedizioni-e-resi": "Spedizioni e resi",
  faq: "Domande frequenti",
  privacy: "Privacy",
  cookie: "Cookie",
  termini: "Termini di vendita",
} as const;
export type PaginaSlug = keyof typeof PAGINE;

const DEFAULT_NEGOZIO: Negozio = {
  ragione_sociale: STORE.ragioneSociale,
  piva: STORE.piva,
  indirizzo: STORE.indirizzo,
  telefono: STORE.telefono,
  email: "",
  whatsapp: "",
  orari_testo: STORE.orari,
};

const DEFAULT_HOME: Home = {
  titolo: "Tutto per la tua casa, a due passi da te",
  sottotitolo: "Biancheria, bagno, cucina, intimo e cura della persona dei migliori marchi. Spedizione in tutta Italia o ritiro gratuito in negozio a Giarre.",
  cta_testo: "Scopri le offerte",
  cta_link: "/offerte",
};

const obj = (v: Json | undefined) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const str = (v: Json | undefined, fallback = "") => (typeof v === "string" && v ? v : fallback);
const num = (v: Json | undefined) => (typeof v === "number" ? v : null);

export const getSettings = cache(async () => {
  const { data } = await createPublicClient().from("settings").select("*");
  return new Map((data ?? []).map((r) => [r.chiave, r.valore]));
});

export async function getNegozio(): Promise<Negozio> {
  const v = obj((await getSettings()).get("negozio"));
  return Object.fromEntries(
    Object.entries(DEFAULT_NEGOZIO).map(([k, d]) => [k, str(v[k], d)]),
  ) as Negozio;
}

export async function getHome(): Promise<Home> {
  const v = obj((await getSettings()).get("home"));
  return Object.fromEntries(Object.entries(DEFAULT_HOME).map(([k, d]) => [k, str(v[k], d)])) as Home;
}

export async function getSpedizione(): Promise<Spedizione> {
  const s = await getSettings();
  return { costo: num(obj(s.get("costo_spedizione")).cents), soglia: num(obj(s.get("soglia_spedizione_gratuita")).cents) };
}

export async function getPagina(slug: PaginaSlug): Promise<Pagina> {
  const v = obj((await getSettings()).get(`pagina:${slug}`));
  return { titolo: str(v.titolo, PAGINE[slug]), testo: str(v.testo, DEFAULT_TESTI[slug]) };
}

// Testi iniziali: da rivedere col negozio (e, per quelli legali, con un consulente).
const DEFAULT_TESTI: Record<PaginaSlug, string> = {
  "chi-siamo":
    "Shop House è il negozio di casalinghi, tessile per la casa, intimo e cura della persona di Giarre.\n\nSelezioniamo i migliori marchi — Caleffi, Alviero Martini, Trussardi, Gianfranco Ferré, Laura Biagiotti — per portare qualità e convenienza nelle case dei nostri clienti, in negozio e ora anche online.",
  contatti:
    "Puoi contattarci per telefono o passare a trovarci in negozio negli orari di apertura.\n\nPer informazioni su un ordine indica sempre il numero d'ordine (es. SH-2026-00001).",
  "spedizioni-e-resi":
    "## Spedizione\nSpediamo in tutta Italia con corriere espresso. Il costo viene mostrato nel carrello prima del pagamento.\n\n## Ritiro in negozio\nPuoi scegliere il ritiro gratuito in negozio: ti avviseremo via email quando l'ordine è pronto.\n\n## Resi\nHai 14 giorni dalla consegna per esercitare il diritto di recesso. Contattaci indicando il numero d'ordine.",
  faq:
    "## Posso ritirare in negozio?\nSì, il ritiro è gratuito: scegli \"Ritiro in negozio\" al momento dell'ordine.\n\n## Quanto tempo impiega la spedizione?\nDi solito 24–72 ore lavorative dalla conferma dell'ordine.\n\n## Posso restituire un prodotto?\nSì, entro 14 giorni dalla consegna. Vedi la pagina Spedizioni e resi.",
  privacy:
    "Testo dell'informativa privacy da completare e far verificare da un consulente prima della pubblicazione.",
  cookie:
    "Questo sito usa solo cookie tecnici necessari al funzionamento (sessione e carrello). Testo da completare prima della pubblicazione.",
  termini:
    "Condizioni generali di vendita da completare e far verificare da un consulente prima della pubblicazione.",
};
