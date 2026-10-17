import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser, rateLimit } from "@/lib/auth";
import { checkoutSchema } from "@/lib/checkout";
import { shippingFor } from "@/lib/format";

class StockError extends Error {}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to place your order." }, { status: 401 });
  if (!rateLimit(`order:${user.id}`, 10)) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const d = parsed.data;

  // Duplicate submission: return the order that already exists for this key
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (existing) return NextResponse.json({ orderNumber: existing.orderNumber }, { status: existing.userId === user.id ? 200 : 409 });

  // Merge duplicate lines, then load trusted prices from the database
  const merged = new Map<string, (typeof d.items)[number]>();
  for (const i of d.items) { const k = `${i.productId}|${i.size}|${i.color}`; const m = merged.get(k); merged.set(k, m ? { ...m, quantity: m.quantity + i.quantity } : i); }
  const lines = [...merged.values()];
  const products = await prisma.product.findMany({ where: { id: { in: lines.map((l) => l.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));
  for (const l of lines) {
    const p = byId.get(l.productId);
    if (!p) return NextResponse.json({ error: "An item in your bag is no longer available." }, { status: 400 });
    if (p.sizes.length && (!l.size || !p.sizes.includes(l.size))) return NextResponse.json({ error: `Choose a valid size for ${p.name}.` }, { status: 400 });
    if (p.colors.length && (!l.color || !p.colors.includes(l.color))) return NextResponse.json({ error: `Choose a valid color for ${p.name}.` }, { status: 400 });
  }
  const priced = lines.map((l) => { const p = byId.get(l.productId)!; const unit = p.salePrice ?? p.price; return { l, p, unit, total: unit * l.quantity }; });
  const itemsSubtotal = priced.reduce((s, x) => s + x.total, 0);
  const shippingCost = shippingFor(itemsSubtotal);
  const totalAmount = itemsSubtotal + shippingCost;
  const orderNumber = `AUR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  try {
    await prisma.$transaction(async (tx) => {
      // Atomic conditional decrement: cannot go negative or oversell under concurrency
      const qtyByProduct = new Map<string, number>();
      for (const x of priced) qtyByProduct.set(x.p.id, (qtyByProduct.get(x.p.id) ?? 0) + x.l.quantity);
      for (const [id, qty] of qtyByProduct) {
        const r = await tx.product.updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
        if (r.count !== 1) throw new StockError(byId.get(id)!.name);
      }
      await tx.order.create({ data: {
        orderNumber, idempotencyKey: d.idempotencyKey, userId: user.id,
        customerName: d.customerName, customerEmail: d.customerEmail, phone: d.phone, country: d.country, province: d.province, city: d.city,
        address: d.landmark ? `${d.address} (${d.landmark})` : d.address, postalCode: d.postalCode || null, notes: d.notes || null,
        itemsSubtotal, shippingCost, discountAmount: 0, totalAmount, paymentMethod: d.paymentMethod, paymentStatus: "PENDING", orderStatus: "PENDING",
        items: { create: priced.map((x) => ({ productId: x.p.id, nameSnapshot: x.p.name, imageSnapshot: x.p.images[0], size: x.l.size, color: x.l.color, quantity: x.l.quantity, unitPrice: x.unit, lineTotal: x.total })) },
        history: { create: { status: "PENDING" } },
      } });
    });
  } catch (e) {
    if (e instanceof StockError) return NextResponse.json({ error: `Sorry, "${e.message}" does not have enough stock.` }, { status: 409 });
    const dup = await prisma.order.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
    if (dup) return NextResponse.json({ orderNumber: dup.orderNumber });
    console.error("order failed", (e as Error).message);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ orderNumber }, { status: 201 });
}
