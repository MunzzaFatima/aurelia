"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const r = useRouter();
  return <button className="mt-2 w-full border-t border-charcoal/10 pt-3 text-left" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/"); r.refresh(); }}>Log out</button>;
}
