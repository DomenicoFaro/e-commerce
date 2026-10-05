/** Colore del pallino per i nomi di colore più comuni nelle varianti. */
const SWATCH: Record<string, string> = {
  bianco: "#ffffff", panna: "#f5efe0", avorio: "#f3ecd8", beige: "#d9c7a7", sabbia: "#d6c2a0", tortora: "#a89a8a",
  grigio: "#9ca3af", antracite: "#3f4247", nero: "#111111", blu: "#1e3a8a", azzurro: "#7cb7e8", celeste: "#a9d4f5",
  verde: "#2f855a", salvia: "#9caf88", rosso: "#c53030", bordeaux: "#6b1d2a", rosa: "#f4a7b9", cipria: "#e8c4c0",
  giallo: "#f2c14e", arancione: "#ed8936", viola: "#805ad5", lilla: "#c4b5fd", marrone: "#7b4a2e", oro: "#d4af37",
};

export const swatch = (nome: string) => SWATCH[nome.toLowerCase().split(/[\s/-]/)[0]];
