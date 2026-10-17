import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE = "aurelia_session";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export async function createSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setExpirationTime("7d").sign(key());
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export function destroySession() { cookies().delete(COOKIE); }

export async function getUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return await prisma.user.findUnique({ where: { id: payload.sub! }, select: { id: true, fullName: true, email: true, role: true } });
  } catch { return null; }
}
export async function requireAdmin() {
  const u = await getUser();
  return u && u.role === "ADMIN" ? u : null;
}

// Simple in-memory rate limiter (use Redis/Upstash for multi-instance production)
const hits = new Map<string, { n: number; t: number }>();
export function rateLimit(id: string, max = 8, windowMs = 60_000) {
  const now = Date.now(); const h = hits.get(id);
  if (!h || now - h.t > windowMs) { hits.set(id, { n: 1, t: now }); return true; }
  h.n++; return h.n <= max;
}
