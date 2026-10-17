import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OrderCard from "@/components/OrderCard";
export const dynamic = "force-dynamic";
export default async function Confirmation({ params }: { params: { orderNumber: string } }) {
  const user = await getUser(); if (!user) redirect("/signin");
  const o = await prisma.order.findFirst({ where: { orderNumber: params.orderNumber, userId: user.id }, include: { items: true } });
  if (!o) notFound(); // other customers' orders look like 404
  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="text-5xl">Thank you for shopping with AURELIA!</h1>
      <p className="mb-8 mt-3">Your order has been placed successfully. Order number: <strong>{o.orderNumber}</strong></p>
      {o.paymentMethod === "BANK_TRANSFER" && <p className="mb-6 bg-cream p-4 text-sm">Please transfer {o.totalAmount.toLocaleString()} PKR using your order number as the reference. We will confirm once payment is verified.</p>}
      <OrderCard o={o} /><Link href="/products" className="btn btn-line mt-8">Continue shopping</Link>
    </div>
  );
}
