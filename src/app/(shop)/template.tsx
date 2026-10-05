/** Rimontato a ogni cambio pagina: dissolvenza in entrata del contenuto. */
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
