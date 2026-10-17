"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "./CartProvider";
type P = { id: string; slug: string; name: string; image: string; price: number; sizes: string[]; colors: string[]; stock: number };
export default function AddToCart({ product: p }: { product: P }) {
  const { add } = useCart();
  const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [qty, setQty] = useState(1);
  const [err, setErr] = useState(""); const [done, setDone] = useState(false);
  const go = () => {
    if (p.sizes.length && !size) return setErr("Please choose a size.");
    if (p.colors.length && !color) return setErr("Please choose a color.");
    setErr(""); add({ productId: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, size: size || undefined, color: color || undefined, qty });
    setDone(true); setTimeout(() => setDone(false), 1800);
  };
  const chip = (on: boolean) => `border px-4 py-2 text-sm transition-colors ${on ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/25 hover:border-charcoal"}`;
  return (
    <div className="mt-6 space-y-5">
      {p.sizes.length > 0 && <div><p className="label">Size</p><div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} type="button" aria-pressed={size === s} className={chip(size === s)} onClick={() => setSize(s)}>{s}</button>)}</div></div>}
      {p.colors.length > 0 && <div><p className="label">Color</p><div className="flex flex-wrap gap-2">{p.colors.map((c) => <button key={c} type="button" aria-pressed={color === c} className={chip(color === c)} onClick={() => setColor(c)}>{c}</button>)}</div></div>}
      <div><p className="label">Quantity</p><select className="input w-24" value={qty} onChange={(e) => setQty(+e.target.value)}>{Array.from({ length: Math.min(10, Math.max(p.stock, 1)) }, (_, i) => <option key={i}>{i + 1}</option>)}</select></div>
      {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
      <button onClick={go} disabled={p.stock === 0} className="btn btn-dark w-full md:w-auto">{done ? <><Check size={16} /> Added to bag</> : "Add to bag"}</button>
    </div>
  );
}
