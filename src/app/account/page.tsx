import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";
export const metadata = { title: "My profile" };
export const dynamic = "force-dynamic";
export default async function Account() {
  const user = await getUser(); if (!user) redirect("/signin");
  const [full, orders] = await Promise.all([prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } }), prisma.order.count({ where: { userId: user.id } })]);
  return (
    <div className="wrap max-w-2xl py-12">
      <h1 className="text-5xl">Hello, {user.fullName.split(" ")[0]}!</h1>
      <dl className="mt-8 space-y-3 border-y border-charcoal/10 py-6 text-sm">
        <div className="flex justify-between"><dt>Name</dt><dd>{user.fullName}</dd></div><div className="flex justify-between"><dt>Email</dt><dd>{user.email}</dd></div>
        <div className="flex justify-between"><dt>Member since</dt><dd>{fmtDate(full!.createdAt)}</dd></div><div className="flex justify-between"><dt>Orders placed</dt><dd>{orders}</dd></div>
      </dl>
      <div className="mt-6 flex gap-4"><Link href="/orders" className="btn btn-dark">View my orders</Link></div><div className="mt-6 w-40"><LogoutButton /></div>
    </div>
  );
}
