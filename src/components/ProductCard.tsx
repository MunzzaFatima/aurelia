import Link from "next/link";
import { Star } from "lucide-react";
import { pkr } from "@/lib/format";
type P = { slug: string; name: string; price: number; salePrice: number | null; images: string[]; rating: number; reviewCount: number; stock: number; bestSeller: boolean; subcategory: string };
export default function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative overflow-hidden bg-beige">
        <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {p.salePrice && <span className="absolute left-3 top-3 bg-gold-deep px-2 py-1 text-xs text-white">Sale</span>}
        {p.stock === 0 && <span className="absolute inset-0 flex items-center justify-center bg-ivory/70 text-sm">Sold out</span>}
      </div>
      <div className="pt-3">
        <p className="text-xs text-charcoal/60">{p.subcategory}</p>
        <h3 className="font-serif text-xl leading-snug">{p.name}</h3>
        <p className="text-sm">{p.salePrice ? <><span className="text-gold-deep">{pkr(p.salePrice)}</span> <s className="text-charcoal/50">{pkr(p.price)}</s></> : pkr(p.price)}</p>
        <p className="flex items-center gap-1 text-xs text-charcoal/60"><Star size={12} className="fill-gold text-gold" />{p.rating} ({p.reviewCount} demo reviews)</p>
      </div>
    </Link>
  );
}
