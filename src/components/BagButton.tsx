"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
export default function BagButton() {
  const { count, setOpen, bump } = useCart();
  return (
    <button aria-label={`Open bag, ${count} items`} onClick={() => setOpen(true)} className="relative">
      <ShoppingBag key={bump} size={22} className={bump ? "bag-pop" : ""} />
      {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-deep text-[10px] text-white">{count}</span>}
    </button>
  );
}
