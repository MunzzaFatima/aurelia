import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-24 bg-charcoal text-ivory/80">
      <div className="wrap grid gap-10 py-14 md:grid-cols-3">
        <div><p className="font-serif text-3xl tracking-[0.25em] text-ivory">AURELIA</p><p className="mt-3 text-sm">Elegance in Every Detail.</p></div>
        <div className="text-sm"><p className="mb-3 text-ivory">Shop</p><Link className="block py-1" href="/products">All products</Link><Link className="block py-1" href="/products?category=womens-fashion">Women</Link><Link className="block py-1" href="/products?category=mens-fashion">Men</Link><Link className="block py-1" href="/products?category=jewelry">Jewelry</Link></div>
        <div className="text-sm"><p className="mb-3 text-ivory">Your account</p><Link className="block py-1" href="/account">Profile</Link><Link className="block py-1" href="/orders">My orders</Link><Link className="block py-1" href="/signin">Sign in</Link></div>
      </div>
      <p className="border-t border-ivory/10 py-5 text-center text-xs">© {new Date().getFullYear()} AURELIA. Demo storefront: products and reviews are sample data.</p>
    </footer>
  );
}
