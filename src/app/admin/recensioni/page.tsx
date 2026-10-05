import Link from "next/link";
import { Check, EyeOff, Star } from "lucide-react";
import { deleteReview, setReviewApproved } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Badge, Card, Empty, PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/admin";

export const metadata = { title: "Recensioni" };

export default async function AdminReviews() {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("reviews")
    .select("*, products(titolo, slug)")
    .order("approvata")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Recensioni" />
      {!data?.length ? (
        <Empty>Nessuna recensione. I clienti potranno recensire i prodotti acquistati.</Empty>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex text-sun" aria-label={`${r.stelle} stelle su 5`}>
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < r.stelle ? "currentColor" : "none"} />)}
                  </span>
                  <Badge className={r.approvata ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                    {r.approvata ? "Pubblicata" : "In attesa"}
                  </Badge>
                </div>
                <Link href={`/p/${r.products?.slug}`} target="_blank" className="text-sm font-semibold text-navy hover:underline">{r.products?.titolo}</Link>
                {r.testo && <p className="mt-1 text-sm text-neutral-700">{r.testo}</p>}
                <p className="mt-1 text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString("it-IT")}</p>
              </div>
              <div className="flex gap-1">
                <form action={setReviewApproved}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="approvata" value={r.approvata ? "0" : "1"} />
                  <Button size="sm" variant={r.approvata ? "outline" : "dark"}>
                    {r.approvata ? <><EyeOff size={16} /> Nascondi</> : <><Check size={16} /> Approva</>}
                  </Button>
                </form>
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message="Eliminare questa recensione?" label="" />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
