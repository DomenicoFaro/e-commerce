# Pubblicazione su Vercel

Guida passo passo per mettere online Shop House Giarre.

## 1. Accesso a Vercel (una volta sola)

1. Crea un account su [vercel.com](https://vercel.com/signup) (anche con email).
2. Nel terminale, dentro la cartella del progetto:

   ```bash
   npx vercel login
   ```

## 2. Crea il progetto su Vercel (senza pubblicare)

```bash
npx vercel link
```

Rispondi alle domande:
- *Set up?* → **Y**
- *Which scope?* → il tuo account
- *Link to existing project?* → **N**
- *Project name?* → `shophouse-giarre`
- *In which directory is your code located?* → `./`

Così il progetto esiste su Vercel ma non è ancora online: prima servono le variabili (la build legge già
i prodotti da Supabase e senza chiavi fallirebbe).

## 3. Variabili d'ambiente

Su vercel.com → progetto `shophouse-giarre` → *Settings → Environment Variables*
(ambienti **Production** e **Preview**):

| Nome | Valore |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jcpbtsalnslxoanyzpfq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave *publishable* (`sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave *secret* (`sb_secret_…`) — vedi punto 7 |
| `NEXT_PUBLIC_SITE_URL` | l'indirizzo del sito, es. `https://shophouse-giarre.vercel.app` |
| `SITE_INDEXABLE` | `false` finché il sito non è pronto al pubblico |

## 4. Pubblicazione

Dopo aver inserito le variabili, la cartella viene caricata (senza `.env.local`, `node_modules` e `.next`,
esclusi da `.vercelignore`) e compilata da Vercel:

```bash
npx vercel --prod
```

L'indirizzo finale è quello mostrato come **Production** (es. `https://shophouse-giarre.vercel.app`).
Se è diverso da `NEXT_PUBLIC_SITE_URL`, correggi la variabile e ripeti `npx vercel --prod`.

### Regione (velocità)

In *Project → Settings → Functions → Function Region* scegli la regione più vicina al database Supabase
(la trovi in Supabase → *Project Settings → General*). Esempio: Supabase `eu-central-1` (Francoforte) → Vercel **Frankfurt (fra1)**.

## 5. Supabase: indirizzi per login ed email

Supabase → *Authentication → URL Configuration*:

- **Site URL**: l'indirizzo del sito (es. `https://shophouse-giarre.vercel.app`)
- **Redirect URLs**: aggiungi
  - `https://shophouse-giarre.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (per lo sviluppo)
  - `https://*.vercel.app/auth/callback` (anteprime, facoltativo)

Senza questo i link di conferma registrazione e recupero password portano a localhost.

## 6. Verifica dopo la pubblicazione

- [ ] Home, categorie, ricerca con suggerimenti, pagina prodotto
- [ ] Aggiungi al carrello → `/carrello`
- [ ] Accesso con il tuo account → *Pannello admin*
- [ ] Modifica un prezzo dall'admin → compare subito sul sito
- [ ] Carica una foto prodotto → compare sul sito
- [ ] Velocità: [PageSpeed Insights](https://pagespeed.web.dev/) sull'indirizzo pubblico (obiettivo mobile ≥ 90)

## 7. Sicurezza prima del lancio

- La chiave **secret** di Supabase è stata condivisa in chat durante lo sviluppo: generane una nuova
  (Supabase → *Project Settings → API Keys* → crea una nuova secret key), mettila su Vercel e in `.env.local`,
  poi elimina quella vecchia.
- Completa e fai verificare i testi di **Privacy, Cookie e Termini** (Admin → Impostazioni e pagine).
- Al lancio imposta `SITE_INDEXABLE=true` e collega il dominio definitivo
  (*Vercel → Settings → Domains*), aggiornando `NEXT_PUBLIC_SITE_URL` e gli URL su Supabase.

## Aggiornamenti futuri

Dalla cartella del progetto:
- `npx vercel` → nuova anteprima (indirizzo separato, per provare)
- `npx vercel --prod` → aggiorna il sito pubblico
