"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import CartToast from "./CartToast";

// Carrello salvato nel browser (localStorage): funziona anche per chi compra senza account.
// Prezzi e disponibilità vengono sempre riletti dal database, qui ci sono solo id e quantità.

export type CartLine = { variantId: string; quantita: number };

/** Dati mostrati nella notifica "Aggiunto al carrello". */
export type AddedInfo = { titolo: string; opzioni?: string; immagine: string; prezzo: number; quantita: number };

type CartContext = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (variantId: string, quantita: number, max?: number, info?: AddedInfo) => void;
  setQuantity: (variantId: string, quantita: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const KEY = "shophouse-carrello";
const Ctx = createContext<CartContext | null>(null);

function read(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((l) => typeof l?.variantId === "string" && Number.isInteger(l?.quantita) && l.quantita > 0)
      : [];
  } catch {
    return [];
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [added, setAdded] = useState<(AddedInfo & { id: number }) | null>(null);
  const closeToast = useCallback(() => setAdded(null), []);

  useEffect(() => {
    setLines(read());
    setReady(true);
    // Sincronizza tra schede aperte
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((update: (prev: CartLine[]) => CartLine[]) => {
    setLines((prev) => {
      const next = update(prev).filter((l) => l.quantita > 0);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage non disponibile (navigazione privata): il carrello resta in memoria */
      }
      return next;
    });
  }, []);

  const value = useMemo<CartContext>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantita, 0),
      add: (variantId, quantita, max = Infinity, info) => {
        if (info) setAdded({ ...info, id: Date.now() });
        save((prev) => {
          const existing = prev.find((l) => l.variantId === variantId);
          const q = Math.min((existing?.quantita ?? 0) + quantita, max);
          return existing
            ? prev.map((l) => (l.variantId === variantId ? { ...l, quantita: q } : l))
            : [...prev, { variantId, quantita: q }];
        });
      },
      setQuantity: (variantId, quantita) =>
        save((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, quantita } : l))),
      remove: (variantId) => save((prev) => prev.filter((l) => l.variantId !== variantId)),
      clear: () => save(() => []),
    }),
    [lines, ready, save],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {added && <CartToast key={added.id} info={added} count={value.count} onClose={closeToast} />}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart va usato dentro <CartProvider>");
  return ctx;
}
