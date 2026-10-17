# AURELIA — Elegance in Every Detail.

Next.js 14 (App Router, TypeScript) · Tailwind · PostgreSQL · Prisma · bcrypt + signed HTTP-only JWT session cookie · Zod.

## Setup
1. Install Node.js 18.18+ and PostgreSQL 14+.
2. Create the database: `createdb aurelia` (or use pgAdmin).
3. `cp .env.example .env`, then edit `DATABASE_URL`, set `AUTH_SECRET` (`openssl rand -base64 32`), admin credentials and bank details.
4. `npm install`
5. `npm run db:setup` (runs migration, then seeds 70 demo products + the admin account)
6. `npm run dev` → http://localhost:3000

Admin: sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then open **Admin dashboard** from the account menu.

## Implemented
Home, products (filters, sort, search, pagination), product detail, cart drawer, 4-step checkout (COD + bank transfer), sign up / sign in / logout, profile, My Orders with timeline, order confirmation, admin (stats, order search/filter, status + payment update, low-stock list), 404.
Server-side: trusted prices, stock check via atomic conditional decrement inside a transaction, idempotency key against duplicate submits, per-user order scoping, admin role check on every admin route, login/register rate limiting, restock on cancellation.

## Not implemented yet (be aware)
Wishlist, reviews (ratings are demo seed values), admin product/category CRUD and image upload, edit profile / saved addresses, DB-stored cart (cart is in localStorage), customer self-cancellation, privacy/terms/about/contact pages, online payment gateway, automated tests, real photography (placeholder SVGs from `/api/img`).

## Deploy
Vercel/any Node host + managed Postgres (Neon, Supabase, Railway). Set the same env vars, run `npx prisma migrate deploy` and `npm run db:seed` once, then `npm run build && npm start`. The in-memory rate limiter should be swapped for Redis on multi-instance hosts.
