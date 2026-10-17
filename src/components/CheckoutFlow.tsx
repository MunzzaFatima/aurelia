"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import { pkr, shippingFor } from "@/lib/format";

const STEPS = ["Review", "Details", "Payment", "Confirm"];
export default function CheckoutFlow({ user, bank }: { user: { name: string; email: string } | null; bank: { name: string; title: string; iban: string } }) {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const r = useRouter();
  const [step, setStep] = useState(0); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const key = useMemo(() => crypto.randomUUID(), []);
  const [f, setF] = useState({ customerName: user?.name ?? "", customerEmail: user?.email ?? "", phone: "", country: "Pakistan", province: "", city: "", address: "", landmark: "", postalCode: "", notes: "", paymentMethod: "COD" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const ship = shippingFor(subtotal);

  if (!items.length) return <div className="wrap py-24 text-center"><h1 className="text-5xl">Your bag is empty</h1><Link href="/products" className="btn btn-dark mt-8">Continue shopping</Link></div>;
  if (!user) return <div className="wrap py-24 text-center"><h1 className="text-5xl">Sign in to check out</h1><p className="mt-3 text-charcoal/70">Your bag is saved on this device and will be waiting.</p><div className="mt-8 flex justify-center gap-4"><Link href="/signin" className="btn btn-dark">Sign in</Link><Link href="/signup" className="btn btn-line">Create account</Link></div></div>;

  function next() {
    setErr("");
    if (step === 1) {
      if (f.customerName.trim().length < 2) return setErr("Enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(f.customerEmail)) return setErr("Enter a valid email address.");
      if (!/^(\+92|0)?3\d{9}$|^\+?\d{10,14}$/.test(f.phone.trim())) return setErr("Enter a valid phone number.");
      if (!f.province.trim() || !f.city.trim() || f.address.trim().length < 8) return setErr("Complete the province, city and delivery address.");
    }
    setStep(step + 1);
  }
  async function place() {
    setBusy(true); setErr("");
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, idempotencyKey: key, items: items.map((i) => ({ productId: i.productId, quantity: i.qty, size: i.size, color: i.color })) }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setBusy(false); return setErr(data.error || "Could not place your order."); }
    clear(); r.push(`/orders/${data.orderNumber}`);
  }
  return (
    <div className="wrap max-w-4xl py-12">
      <h1 className="text-5xl">Checkout</h1>
      <ol className="my-8 flex gap-2 text-sm">{STEPS.map((s, i) => <li key={s} className={`flex-1 border-t-2 pt-2 ${i <= step ? "border-gold-deep" : "border-charcoal/15 text-charcoal/50"}`}>{s}</li>)}</ol>

      {step === 0 && <div className="space-y-5">{items.map((i) => (
        <div key={`${i.productId}${i.size}${i.color}`} className="flex gap-4 border-b border-charcoal/10 pb-5">
          <img src={i.image} alt={i.name} className="h-28 w-24 bg-beige object-cover" />
          <div className="flex-1"><p className="font-serif text-xl">{i.name}</p><p className="text-sm text-charcoal/60">{[i.size, i.color].filter(Boolean).join(" · ")} · {pkr(i.price)} each</p>
            <div className="mt-3 flex items-center gap-4"><div className="flex items-center border border-charcoal/20"><button aria-label="Decrease" className="p-2" onClick={() => setQty(i, i.qty - 1)}><Minus size={14} /></button><span className="w-8 text-center">{i.qty}</span><button aria-label="Increase" className="p-2" onClick={() => setQty(i, i.qty + 1)}><Plus size={14} /></button></div><button className="text-xs underline" onClick={() => remove(i)}>Remove</button></div></div>
          <p>{pkr(i.price * i.qty)}</p></div>))}
        <Totals subtotal={subtotal} ship={ship} /><p className="text-xs text-charcoal/60">Prices are re-checked against the store when you place the order.</p></div>}

      {step === 1 && <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" v={f.customerName} on={set("customerName")} /><Field label="Email address" v={f.customerEmail} on={set("customerEmail")} type="email" />
        <Field label="Phone number" v={f.phone} on={set("phone")} /><Field label="Country" v={f.country} on={set("country")} />
        <Field label="Province or state" v={f.province} on={set("province")} /><Field label="City" v={f.city} on={set("city")} />
        <div className="md:col-span-2"><Field label="Complete delivery address" v={f.address} on={set("address")} /></div>
        <Field label="Apartment, house or landmark (optional)" v={f.landmark} on={set("landmark")} /><Field label="Postal code (optional)" v={f.postalCode} on={set("postalCode")} />
        <div className="md:col-span-2"><label className="label" htmlFor="notes">Order notes (optional)</label><textarea id="notes" value={f.notes} onChange={set("notes")} className="input" rows={3} /></div></div>}

      {step === 2 && <div className="space-y-4">
        {[["COD", "Cash on delivery", "Pay in cash when your order arrives."], ["BANK_TRANSFER", "Bank transfer", "Transfer the total, then we verify the payment before dispatch."]].map(([v, t, d]) => (
          <label key={v} className={`flex cursor-pointer gap-4 border p-5 ${f.paymentMethod === v ? "border-charcoal" : "border-charcoal/20"}`}><input type="radio" name="pm" checked={f.paymentMethod === v} onChange={() => setF({ ...f, paymentMethod: v })} /><span><span className="block font-serif text-xl">{t}</span><span className="text-sm text-charcoal/70">{d}</span></span></label>))}
        {f.paymentMethod === "BANK_TRANSFER" && <div className="bg-cream p-5 text-sm"><p>Bank: {bank.name || "Not configured"}</p><p>Account title: {bank.title}</p><p>IBAN: {bank.iban}</p><p className="mt-2 text-charcoal/70">Use your order number as the reference. Never share card PINs, passwords or OTPs with anyone.</p></div>}
        <p className="text-xs text-charcoal/60">Online card payments are not available until a payment gateway is integrated.</p></div>}

      {step === 3 && <div className="space-y-5 text-sm"><div className="bg-cream p-5"><p className="font-serif text-xl">Deliver to</p><p>{f.customerName} · {f.phone}</p><p>{f.address}{f.landmark && `, ${f.landmark}`}, {f.city}, {f.province}, {f.country} {f.postalCode}</p><p className="mt-2">Payment: {f.paymentMethod === "COD" ? "Cash on delivery" : "Bank transfer (pending verification)"}</p></div>
        {items.map((i) => <div key={`${i.productId}${i.size}${i.color}`} className="flex justify-between"><span>{i.qty} × {i.name} {[i.size, i.color].filter(Boolean).join(" / ")}</span><span>{pkr(i.price * i.qty)}</span></div>)}<Totals subtotal={subtotal} ship={ship} /></div>}

      {err && <p role="alert" className="mt-6 text-sm text-red-800">{err}</p>}
      <div className="mt-8 flex justify-between">
        {step > 0 ? <button className="btn btn-line" onClick={() => setStep(step - 1)}>Back</button> : <Link href="/products" className="btn btn-line">Continue shopping</Link>}
        {step < 3 ? <button className="btn btn-dark" onClick={next}>Continue</button> : <button className="btn btn-dark" disabled={busy} onClick={place}>{busy ? "Placing order…" : "Confirm and place order"}</button>}
      </div>
    </div>
  );
}
function Field({ label, v, on, type = "text" }: { label: string; v: string; on: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
  return <div><label className="label">{label}</label><input className="input" type={type} value={v} onChange={on} /></div>;
}
function Totals({ subtotal, ship }: { subtotal: number; ship: number }) {
  return <div className="space-y-1 pt-2 text-right"><p>Subtotal {pkr(subtotal)}</p><p>Shipping {ship ? pkr(ship) : "Free"}</p><p className="font-serif text-2xl">Total {pkr(subtotal + ship)}</p></div>;
}
