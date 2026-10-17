import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import { pkr } from "@/lib/format";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  return { title: p?.name ?? "Product", description: p?.description };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!p) notFound();
  const related = await prisma.product.findMany({ where: { categoryId: p.categoryId, NOT: { id: p.id } }, take: 4 });
  const unit = p.salePrice ?? p.price;
  return (
    <div className="wrap py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <img src={p.images[0]} alt={p.name} className="aspect-[4/5] w-full bg-beige object-cover" />
        <div>
          <p className="text-sm text-charcoal/60">{p.category.name} / {p.subcategory}</p>
          <h1 className="mt-2 text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl">{p.salePrice ? <><span className="text-gold-deep">{pkr(p.salePrice)}</span> <s className="text-base text-charcoal/50">{pkr(p.price)}</s></> : pkr(p.price)}</p>
          <p className="mt-1 text-xs text-charcoal/60">Rating {p.rating} from {p.reviewCount} demo reviews (sample data)</p>
          <p className="mt-6 max-w-lg leading-relaxed text-charcoal/80">{p.description}</p>
          <p className={`mt-4 text-sm ${p.stock > 0 ? "text-green-800" : "text-red-800"}`}>{p.stock === 0 ? "Sold out" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</p>
          <AddToCart product={{ id: p.id, slug: p.slug, name: p.name, image: p.images[0], price: unit, sizes: p.sizes, colors: p.colors, stock: p.stock }} />
          <p className="mt-6 text-xs text-charcoal/60">SKU {p.sku}</p>
        </div>
      </div>
      <h2 className="mb-6 mt-20 text-3xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
    </div>
  );
}
