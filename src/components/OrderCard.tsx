import { pkr, fmtDate } from "@/lib/format";
const FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ");
type O = { orderNumber: string; createdAt: Date; totalAmount: number; paymentMethod: string; paymentStatus: string; orderStatus: string; items: { id: string; nameSnapshot: string; quantity: number; size: string | null; color: string | null; lineTotal: number }[] };
export default function OrderCard({ o }: { o: O }) {
  const idx = FLOW.indexOf(o.orderStatus);
  return (
    <article className="border border-charcoal/15 bg-white/50 p-6">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="text-2xl">{o.orderNumber}</h2><p className="text-sm text-charcoal/60">{fmtDate(o.createdAt)}</p></div>
      {o.orderStatus === "CANCELLED" ? <p className="mt-4 text-sm text-red-800">This order was cancelled.</p> :
        <ol className="my-5 flex text-xs">{FLOW.map((s, i) => <li key={s} className={`flex-1 border-t-2 pt-2 ${i <= idx ? "border-gold-deep text-charcoal" : "border-charcoal/15 text-charcoal/40"}`}>{label(s)}</li>)}</ol>}
      <ul className="space-y-1 text-sm">{o.items.map((i) => <li key={i.id} className="flex justify-between"><span>{i.quantity} × {i.nameSnapshot} {[i.size, i.color].filter(Boolean).join(" / ")}</span><span>{pkr(i.lineTotal)}</span></li>)}</ul>
      <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-charcoal/10 pt-4 text-sm"><span>{o.paymentMethod === "COD" ? "Cash on delivery" : "Bank transfer"} · Payment {label(o.paymentStatus)} · Status {label(o.orderStatus)}</span><span className="font-serif text-xl">{pkr(o.totalAmount)}</span></div>
    </article>
  );
}
