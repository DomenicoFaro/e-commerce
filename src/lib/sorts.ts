// Separato da catalog.ts (solo server) perché serve anche nei componenti client.
export const SORTS = {
  rilevanza: "Rilevanza",
  novita: "Novità",
  "prezzo-asc": "Prezzo crescente",
  "prezzo-desc": "Prezzo decrescente",
} as const;
export type Sort = keyof typeof SORTS;
