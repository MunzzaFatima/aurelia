import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
const PER = 12;

export default async function Products({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { category, q, sort = "newest", min, max, size, color } = searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const where: Prisma.ProductWhereInput = {
    ...(category && { category: { slug: category } }),
    ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { subcategory: { contains: q, mode: "insensitive" } }, { category: { name: { contains: q, mode: "insensitive" } } }] }),
    ...((min || max) && { price: { ...(min && { gte: +min || 0 }), ...(max && { lte: +max || 10_000_000 }) } }),
    ...(size && { sizes: { has: size } }), ...(color && { colors: { has: color } }),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : sort === "popular" ? { reviewCount: "desc" } : sort === "rating" ? { rating: "desc" } : { createdAt: "desc" };
  const [items, total, cats] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * PER, take: PER }),
    prisma.product.count({ where }), prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pages = Math.ceil(total / PER);
  const href = (p: number) => `/products?${new URLSearchParams(Object.entries({ ...searchParams, page: String(p) }).filter(([, v]) => v) as [string, string][])}`;
  const title = q ? `Results for “${q}”` : cats.find((c) => c.slug === category)?.name || "All products";

  return (
    <div className="wrap py-12">
      <h1 className="text-5xl">{title}</h1><p className="mt-1 text-sm text-charcoal/60">{total} products</p>
      <form className="my-8 grid gap-3 border-y border-charcoal/10 py-5 md:grid-cols-6">
        <input name="q" defaultValue={q} placeholder="Search" aria-label="Search" className="input md:col-span-2" />
        <select name="category" defaultValue={category || ""} aria-label="Category" className="input"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
        <input name="min" type="number" defaultValue={min} placeholder="Min PKR" aria-label="Minimum price" className="input" />
        <input name="max" type="number" defaultValue={max} placeholder="Max PKR" aria-label="Maximum price" className="input" />
        <select name="sort" defaultValue={sort} aria-label="Sort" className="input"><option value="newest">Newest</option><option value="popular">Most popular</option><option value="rating">Top rated</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
        <input name="size" defaultValue={size} placeholder="Size (e.g. M, 40)" aria-label="Size" className="input" />
        <input name="color" defaultValue={color} placeholder="Color" aria-label="Color" className="input" />
        <button className="btn btn-dark md:col-span-2">Apply filters</button>
      </form>
      {items.length === 0 ? <p className="py-20 text-center text-charcoal/60">No products match these filters. <Link href="/products" className="underline">Clear filters</Link></p> :
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      {pages > 1 && <div className="mt-12 flex justify-center gap-2">{Array.from({ length: pages }, (_, i) => <Link key={i} href={href(i + 1)} className={`h-10 w-10 border text-center leading-10 ${page === i + 1 ? "bg-charcoal text-ivory" : "border-charcoal/25"}`}>{i + 1}</Link>)}</div>}
    </div>
  );
}
