import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";

export default async function Home() {
  const [cats, fresh, best] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.product.findMany({ where: { bestSeller: true }, orderBy: { reviewCount: "desc" }, take: 4 }),
  ]);
  return (
    <>
      <section className="bg-cream">
        <div className="wrap grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="hero-rise">
            <p className="text-sm text-gold-deep">Elegance in Every Detail.</p>
            <h1 className="mt-4 text-5xl leading-[1.05] md:text-7xl">Discover Your Signature Elegance.</h1>
            <p className="mt-6 max-w-md text-charcoal/70">Fashion, jewelry, fragrance and home pieces chosen for how they feel as much as how they look.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Link href="/products" className="btn btn-dark">Shop now</Link><a href="#collections" className="btn btn-line">Explore collections</a></div>
          </div>
          <img src="/api/img?t=The%20AURELIA%20Edit&c=womens-fashion" alt="AURELIA featured collection" className="aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <section id="collections" className="wrap pt-20">
        <h2 className="mb-8 text-4xl">Shop by collection</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group relative block overflow-hidden bg-beige">
              <img src={`/api/img?t=${encodeURIComponent(c.name)}&c=${c.slug}`} alt={c.name} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/60 to-transparent p-4 font-serif text-2xl text-ivory">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap pt-20"><div className="mb-8 flex items-end justify-between"><h2 className="text-4xl">New arrivals</h2><Link href="/products?sort=newest" className="text-sm underline">View all</Link></div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{fresh.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>

      <section className="mt-20 bg-charcoal py-16 text-center text-ivory"><div className="wrap"><h2 className="text-4xl">Free shipping over PKR 15,000</h2><p className="mt-3 text-ivory/70">Pay with cash on delivery or bank transfer.</p></div></section>

      <section className="wrap pt-20"><div className="mb-8 flex items-end justify-between"><h2 className="text-4xl">Best sellers</h2><Link href="/products?sort=popular" className="text-sm underline">View all</Link></div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>

      <section className="wrap grid gap-10 pt-24 md:grid-cols-2 md:items-center">
        <img src="/api/img?t=Our%20Story&c=home-decor" alt="AURELIA brand story" className="aspect-[4/3] w-full object-cover" />
        <div><h2 className="text-4xl">Made to be kept</h2><p className="mt-4 max-w-md leading-relaxed text-charcoal/75">AURELIA brings together the details that finish an outfit and a room: a clasp, a seam, a scent. Each piece is chosen to last beyond the season.</p></div>
      </section>
    </>
  );
}
