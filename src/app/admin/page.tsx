import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pkr, fmtDate } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";
export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";
export default async function Admin({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  if (!(await requireAdmin())) notFound(); // hidden from non-admins; API routes re-check too
  const where = { ...(searchParams.status && { orderStatus: searchParams.status as never }), ...(searchParams.q && { OR: [{ orderNumber: { contains: searchParams.q, mode: "insensitive" as const } }, { customerName: { contains: searchParams.q, mode: "insensitive" as const } }, { customerEmail: { contains: searchParams.q, mode: "insensitive" as const } }] }) };
  const [customers, products, orders, pending, revenue, list, low] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }), prisma.product.count(), prisma.order.count(), prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { OR: [{ paymentStatus: "PAID" }, { orderStatus: "DELIVERED", paymentMethod: "COD" }] } }),
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 50, include: { items: true } }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 8 }),
  ]);
  const stats = [["Customers", customers], ["Products", products], ["Orders", orders], ["Pending orders", pending], ["Revenue (paid or delivered COD)", pkr(revenue._sum.totalAmount ?? 0)]];
  return (
    <div className="wrap py-12">
      <h1 className="text-5xl">Admin dashboard</h1>
      <div className="my-8 grid grid-cols-2 gap-4 md:grid-cols-5">{stats.map(([l, v]) => <div key={l as string} className="bg-cream p-5"><p className="font-serif text-3xl">{v}</p><p className="text-xs text-charcoal/70">{l}</p></div>)}</div>
      <form className="mb-6 flex flex-wrap gap-3"><input name="q" defaultValue={searchParams.q} placeholder="Order number, name or email" className="input max-w-xs" aria-label="Search orders" />
        <select name="status" defaultValue={searchParams.status || ""} className="input max-w-[200px]" aria-label="Status"><option value="">All statuses</option>{["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select><button className="btn btn-dark">Filter</button></form>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-charcoal/20"><tr><th className="py-2">Order</th><th>Customer</th><th>Delivery</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>
        {list.map((o) => <tr key={o.id} className="border-b border-charcoal/10 align-top"><td className="py-3">{o.orderNumber}<br /><span className="text-xs text-charcoal/60">{fmtDate(o.createdAt)}</span></td><td>{o.customerName}<br /><span className="text-xs">{o.customerEmail}<br />{o.phone}</span></td><td className="max-w-[220px] text-xs">{o.address}, {o.city}, {o.province}<br />{o.items.map((i) => `${i.quantity}× ${i.nameSnapshot}`).join(", ")}</td><td>{pkr(o.totalAmount)}</td><td>{o.paymentMethod === "COD" ? "COD" : "Bank"} · {o.paymentStatus}</td><td><OrderStatusSelect id={o.id} status={o.orderStatus} payment={o.paymentStatus} /></td></tr>)}
      </tbody></table></div>
      <h2 className="mb-3 mt-12 text-3xl">Low stock</h2><ul className="text-sm">{low.map((p) => <li key={p.id}>{p.name}: {p.stock} left ({p.sku})</li>)}</ul>
    </div>
  );
}
