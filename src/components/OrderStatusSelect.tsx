"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const S = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export default function OrderStatusSelect({ id, status, payment }: { id: string; status: string; payment: string }) {
  const r = useRouter(); const [msg, setMsg] = useState("");
  async function patch(body: object) {
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({})); setMsg(res.ok ? "Saved" : d.error || "Failed"); r.refresh();
  }
  return <div className="space-y-1"><select aria-label="Order status" defaultValue={status} onChange={(e) => patch({ orderStatus: e.target.value })} className="input !py-1">{S.map((s) => <option key={s}>{s}</option>)}</select>
    {payment === "PENDING" && <button className="text-xs underline" onClick={() => confirm("Mark this payment as received?") && patch({ paymentStatus: "PAID" })}>Mark payment received</button>}<p className="text-xs">{msg}</p></div>;
}
