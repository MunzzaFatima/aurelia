import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BagButton from "./BagButton";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const [user, cats] = await Promise.all([getUser(), prisma.category.findMany({ orderBy: { name: "asc" } })]);
  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur">
      <div className="bg-charcoal py-2 text-center text-xs text-ivory">Complimentary shipping on orders over PKR 15,000 · Cash on delivery available</div>
      <div className="wrap flex items-center justify-between py-4">
        <Link href="/" className="font-serif text-3xl tracking-[0.25em]">AURELIA</Link>
        <form action="/products" className="hidden w-72 items-center border-b border-charcoal/30 md:flex">
          <input name="q" placeholder="Search products" aria-label="Search products" className="w-full bg-transparent py-2 text-sm outline-none" />
          <button aria-label="Search"><Search size={18} /></button>
        </form>
        <div className="flex items-center gap-5">
          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-2 text-sm"><User size={20} /><span className="hidden sm:inline">Hello, {user.fullName.split(" ")[0]}!</span></button>
              <div className="invisible absolute right-0 top-full w-60 translate-y-2 border border-charcoal/10 bg-ivory p-4 text-sm opacity-0 shadow-lg transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-serif text-lg">{user.fullName}</p><p className="mb-3 text-charcoal/60">{user.email}</p>
                <Link href="/account" className="block py-1">My profile</Link><Link href="/orders" className="block py-1">My orders</Link>
                {user.role === "ADMIN" && <Link href="/admin" className="block py-1">Admin dashboard</Link>}
                <LogoutButton />
              </div>
            </div>
          ) : (<Link href="/signin" className="flex items-center gap-2 text-sm"><User size={20} /><span className="hidden sm:inline">Sign in</span></Link>)}
          <BagButton />
        </div>
      </div>
      <nav aria-label="Categories" className="border-y border-charcoal/10"><div className="wrap flex gap-6 overflow-x-auto py-3 text-sm">
        <Link href="/products" className="whitespace-nowrap">All products</Link>
        {cats.map((c) => <Link key={c.id} href={`/products?category=${c.slug}`} className="whitespace-nowrap text-charcoal/75 transition-colors hover:text-gold-deep">{c.name}</Link>)}
      </div></nav>
    </header>
  );
}
