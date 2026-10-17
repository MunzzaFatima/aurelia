import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, rateLimit } from "@/lib/auth";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 8)) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : await bcrypt.compare(parsed.data.password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !ok) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
