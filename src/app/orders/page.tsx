import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OrderCard from "@/components/OrderCard";
export const metadata = { title: "My orders" };
export const dynamic = "force-dynamic";
export default async function Orders() {
  const user = await getUser(); if (!user) redirect("/signin");
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }); // scoped to the session user
  return <div className="wrap max-w-3xl py-12"><h1 className="mb-8 text-5xl">My orders</h1>{orders.length === 0 ? <p>No orders yet. <Link href="/products" className="underline">Start shopping</Link></p> : <div className="space-y-6">{orders.map((o) => <OrderCard key={o.id} o={o} />)}</div>}</div>;
}
