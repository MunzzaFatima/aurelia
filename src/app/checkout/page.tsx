import { getUser } from "@/lib/auth";
import CheckoutFlow from "@/components/CheckoutFlow";
export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await getUser();
  return <CheckoutFlow user={user ? { name: user.fullName, email: user.email } : null} bank={{ name: process.env.BANK_NAME || "", title: process.env.BANK_ACCOUNT_TITLE || "", iban: process.env.BANK_IBAN || "" }} />;
}
