import { NextResponse, type NextRequest } from "next/server";
import { suggestProducts } from "@/lib/catalog";

/** Autocompletamento della ricerca: risposte in cache sul server e nel browser. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const items = q.length < 2 ? [] : await suggestProducts(q.toLowerCase());
  return NextResponse.json(items, { headers: { "Cache-Control": "public, max-age=60, s-maxage=600, stale-while-revalidate=3600" } });
}
