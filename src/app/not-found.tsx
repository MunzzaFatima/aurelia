import Link from "next/link";
export default function NotFound() {
  return <div className="wrap py-32 text-center"><h1 className="text-6xl">Page not found</h1><p className="mt-4 text-charcoal/70">The page you are looking for has moved or does not exist.</p><Link href="/" className="btn btn-dark mt-8">Back to home</Link></div>;
}
