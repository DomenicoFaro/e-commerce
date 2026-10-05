export const DEPARTMENTS = [
  { nome: "Biancheria letto", slug: "biancheria-letto" },
  { nome: "Bagno", slug: "bagno" },
  { nome: "Cucina e tavola", slug: "cucina-e-tavola" },
  { nome: "Intimo e pigiami", slug: "intimo-e-pigiami" },
  { nome: "Casa e arredo tessile", slug: "casa-e-arredo-tessile" },
  { nome: "Igiene casa e persona", slug: "igiene-casa-e-persona" },
  { nome: "Garden", slug: "garden" },
  { nome: "Cartoleria, scuola e party", slug: "cartoleria-scuola-party" },
] as const;

export const QUICK_LINKS = [
  { label: "Offerte", href: "/offerte" },
  { label: "Nuovi arrivi", href: "/s?sort=novita" },
  { label: "Biancheria letto", href: "/c/biancheria-letto" },
  { label: "Bagno", href: "/c/bagno" },
  { label: "Cucina", href: "/c/cucina-e-tavola" },
  { label: "Intimo", href: "/c/intimo-e-pigiami" },
  { label: "Marchi", href: "/marca/caleffi" },
] as const;
