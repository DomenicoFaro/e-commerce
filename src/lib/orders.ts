import type { Enums } from "@/types/database";

export const STATI_ORDINE: Record<Enums<"order_status">, { label: string; classe: string }> = {
  pending: { label: "In attesa di pagamento", classe: "bg-neutral-100 text-neutral-700" },
  paid: { label: "Pagato", classe: "bg-blue-100 text-blue-800" },
  processing: { label: "In preparazione", classe: "bg-amber-100 text-amber-800" },
  shipped: { label: "Spedito", classe: "bg-indigo-100 text-indigo-800" },
  ready_for_pickup: { label: "Pronto per il ritiro", classe: "bg-teal-100 text-teal-800" },
  delivered: { label: "Consegnato", classe: "bg-green-100 text-green-800" },
  cancelled: { label: "Annullato", classe: "bg-red-100 text-red-800" },
  refunded: { label: "Rimborsato", classe: "bg-red-100 text-red-800" },
};
