import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(), paymentStatus: z.literal("PAID").optional() }).strict();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { orderStatus, paymentStatus } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const o = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!o) throw new Error("NF");
      if (orderStatus && orderStatus !== o.orderStatus) {
        if (o.orderStatus === "CANCELLED" || o.orderStatus === "DELIVERED") throw new Error("FINAL");
        if (orderStatus === "CANCELLED") for (const i of o.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } }); // restock
        await tx.order.update({ where: { id: o.id }, data: { orderStatus } });
        await tx.orderStatusHistory.create({ data: { orderId: o.id, status: orderStatus } });
      }
      if (paymentStatus && o.orderStatus !== "CANCELLED") await tx.order.update({ where: { id: o.id }, data: { paymentStatus } });
    });
  } catch (e) {
    const m = (e as Error).message;
    return NextResponse.json({ error: m === "NF" ? "Order not found" : m === "FINAL" ? "Delivered or cancelled orders cannot change status" : "Update failed" }, { status: m === "NF" ? 404 : 409 });
  }
  return NextResponse.json({ ok: true });
}
