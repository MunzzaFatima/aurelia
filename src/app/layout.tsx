import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-serif" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = { title: { default: "AURELIA | Elegance in Every Detail.", template: "%s | AURELIA" }, description: "Premium fashion, jewelry, fragrances and home decor." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body><CartProvider><Header /><main id="main" className="min-h-[60vh]">{children}</main><Footer /></CartProvider></body>
    </html>
  );
}
