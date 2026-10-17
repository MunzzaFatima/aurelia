"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const r = useRouter(); const up = mode === "signup";
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${up ? "register" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error || "Something went wrong.");
    r.push("/"); r.refresh();
  }
  return (
    <div className="wrap max-w-md py-16">
      <h1 className="text-5xl">{up ? "Create your account" : "Welcome back"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {up && <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required autoComplete="name" className="input" /></div>}
        <div><label className="label" htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete={up ? "new-password" : "current-password"} className="input" />{up && <p className="mt-1 text-xs text-charcoal/60">At least 8 characters with upper-case, lower-case and a number.</p>}</div>
        {up && <div><label className="label" htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className="input" /></div>}
        {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
        <button disabled={busy} className="btn btn-dark w-full">{busy ? "Please wait…" : up ? "Create account" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-sm">{up ? <>Already registered? <Link className="underline" href="/signin">Sign in</Link></> : <>New to AURELIA? <Link className="underline" href="/signup">Create an account</Link></>}</p>
    </div>
  );
}
