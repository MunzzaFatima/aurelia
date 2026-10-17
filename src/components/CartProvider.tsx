"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { pkr } from "@/lib/format";

export type CartItem = { productId: string; slug: string; name: string; image: string; price: number; size?: string; color?: string; qty: number };
type Ctx = { items: CartItem[]; count: number; subtotal: number; add: (i: CartItem) => void; setQty: (i: CartItem, q: number) => void; remove: (i: CartItem) => void; clear: () => void; open: boolean; setOpen: (b: boolean) => void; bump: number };
const C = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(C);
const k = (i: CartItem) => `${i.productId}|${i.size ?? ""}|${i.color ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [bump, setBump] = useState(0);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("aurelia_cart") || "[]")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem("aurelia_cart", JSON.stringify(items)); }, [items, ready]);

  const add = (it: CartItem) => { setItems((p) => p.some((x) => k(x) === k(it)) ? p.map((x) => (k(x) === k(it) ? { ...x, qty: Math.min(x.qty + it.qty, 10) } : x)) : [...p, it]); setBump((b) => b + 1); setOpen(true); };
  const setQty = (it: CartItem, q: number) => setItems((p) => p.map((x) => (k(x) === k(it) ? { ...x, qty: Math.max(1, Math.min(q, 10)) } : x)));
  const remove = (it: CartItem) => setItems((p) => p.filter((x) => k(x) !== k(it)));
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <C.Provider value={{ items, count, subtotal, add, setQty, remove, clear: () => setItems([]), open, setOpen, bump }}>
      {children}
      <div className={`fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} />
      <aside aria-label="Shopping bag" className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-charcoal/10 p-5"><h2 className="text-2xl">Your bag ({count})</h2><button aria-label="Close bag" onClick={() => setOpen(false)}><X /></button></div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {items.length === 0 && <p className="text-charcoal/60">Your bag is empty. Browse the collections to add something.</p>}
          {items.map((i) => (
            <div key={k(i)} className="flex gap-4">
              <img src={i.image} alt={i.name} className="h-24 w-20 bg-beige object-cover" />
              <div className="flex-1 text-sm">
                <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="font-serif text-lg leading-tight">{i.name}</Link>
                <p className="text-charcoal/60">{[i.size, i.color].filter(Boolean).join(" · ")}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border border-charcoal/20">
                    <button aria-label="Decrease" className="p-2" onClick={() => setQty(i, i.qty - 1)}><Minus size={14} /></button>
                    <span className="w-8 text-center">{i.qty}</span>
                    <button aria-label="Increase" className="p-2" onClick={() => setQty(i, i.qty + 1)}><Plus size={14} /></button>
                  </div>
                  <span>{pkr(i.price * i.qty)}</span>
                </div>
                <button className="mt-1 text-xs text-charcoal/60 underline" onClick={() => remove(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 border-t border-charcoal/10 p-5">
          <div className="flex justify-between text-lg"><span>Subtotal</span><span>{pkr(subtotal)}</span></div>
          <p className="text-xs text-charcoal/60">Shipping is calculated at checkout.</p>
          <Link href="/checkout" onClick={() => setOpen(false)} className={`btn btn-dark w-full ${items.length ? "" : "pointer-events-none opacity-50"}`}>Checkout</Link>
          <button onClick={() => setOpen(false)} className="btn btn-line w-full">Continue shopping</button>
        </div>
      </aside>
    </C.Provider>
  );
}
