const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

/** Centesimi → "49,90 €" */
export const formatPrice = (cents: number) => eur.format(cents / 100).replace(/\s/g, " ");
