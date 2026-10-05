import { NextResponse, type NextRequest } from "next/server";
import { getCartVariants } from "@/lib/catalog";

const UUID = /^[0-9a-f-]{36}$/i;

/** Prezzi e disponibilità attuali delle varianti nel carrello (mai in cache). */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "").split(",").filter((id) => UUID.test(id));
  const rows = await getCartVariants(ids);
  // Solo prodotti ancora pubblicati
  const visible = rows.filter((r) => r.products?.stato === "published");
  return NextResponse.json(visible, { headers: { "Cache-Control": "no-store" } });
}
