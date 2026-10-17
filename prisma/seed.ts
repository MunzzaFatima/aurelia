import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// FIX: Har product ka naam dekh ke sahi image
const PRODUCT_IMAGES: Record<string, string> = {
  // Women's
  "zarina-festive-dress": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&q=80",
  "noor-embroidered-three-piece": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80",
  "selene-formal-suit": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop&q=80",
  "aria-linen-casual-set": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&q=80",
  // Men's
  "imran-cotton-kurta": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop&q=80",
  "raza-wash-wear-shalwar-kameez": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&q=80",
  "oxford-formal-shirt": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&h=800&fit=crop&q=80",
  "linen-casual-shirt": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80",
  // Jewelry - AB SAHI
  "mughal-kundan-necklace": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&q=80",
  "solitaire-cocktail-ring": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop&q=80",
  // Accessories - AB SAHI
  "duchess-leather-handbag": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop&q=80",
  "gilded-evening-clutch": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop&q=80",
  "slim-bifold-wallet": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop&q=80",
  "reversible-dress-belt": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&q=80",
  // Footwear
  "stiletto-satin-heels": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop&q=80",
  "braided-leather-sandals": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=800&fit=crop&q=80",
  // Fragrances
  "aurelia-femme-eau-de-parfum": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop&q=80",
  "aurelia-homme-eau-de-parfum": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=800&fit=crop&q=80",
  "ambre-nuit-unisex": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop&q=80",
  "royal-oud-intense": "https://images.unsplash.com/photo-1593487568720-92097fb460fb?w=600&h=800&fit=crop&q=80",
  // Home Decor
  "hand-blown-glass-vase": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop&q=80",
  "amber-soy-candle-trio": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=800&fit=crop&q=80",
  "velvet-tufted-cushion-pair": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=800&fit=crop&q=80",
  "brass-table-centerpiece": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=800&fit=crop&q=80",
};

type Def = { name: string; sub: string; price: number };
const CATS: Record<string, { slug: string; sizes: string[]; colors: string[]; items: Def[] }> = {
  "Women's Fashion": { slug: "womens-fashion", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Ivory", "Emerald", "Blush", "Black"], items: [
    { name: "Zarina Festive Dress", sub: "Festive Dresses", price: 18500 },
    { name: "Noor Embroidered Three-Piece", sub: "Embroidered Outfits", price: 22000 },
    { name: "Selene Formal Suit", sub: "Formal Wear", price: 16500 },
    { name: "Aria Linen Casual Set", sub: "Casual Wear", price: 6800 }]},
  "Men's Fashion": { slug: "mens-fashion", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Charcoal", "Navy", "White", "Sand"], items: [
    { name: "Imran Cotton Kurta", sub: "Kurtas", price: 5200 },
    { name: "Raza Wash & Wear Shalwar Kameez", sub: "Shalwar Kameez", price: 6900 },
    { name: "Oxford Formal Shirt", sub: "Formal Shirts", price: 4800 },
    { name: "Linen Casual Shirt", sub: "Casual Shirts", price: 4400 }]},
  "Jewelry": { slug: "jewelry", sizes: [], colors: ["Gold", "Rose Gold", "Silver"], items: [
    { name: "Mughal Kundan Necklace", sub: "Necklaces", price: 21000 },
    { name: "Solitaire Cocktail Ring", sub: "Rings", price: 7200 }]},
  "Accessories": { slug: "accessories", sizes: [], colors: ["Black", "Tan", "Champagne"], items: [
    { name: "Duchess Leather Handbag", sub: "Handbags", price: 19500 },
    { name: "Gilded Evening Clutch", sub: "Clutches", price: 8800 },
    { name: "Slim Bifold Wallet", sub: "Wallets", price: 3900 },
    { name: "Reversible Dress Belt", sub: "Belts", price: 4200 },
  ]},
  "Footwear": { slug: "footwear", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"], colors: ["Black", "Tan", "Gold", "White"], items: [
    { name: "Stiletto Satin Heels", sub: "Heels", price: 11500 },
    { name: "Braided Leather Sandals", sub: "Sandals", price: 5600 },
  ]},
  "Fragrances": { slug: "fragrances", sizes: ["30ml", "50ml", "100ml"], colors: [], items: [
    { name: "Aurelia Femme Eau de Parfum", sub: "Women's Perfumes", price: 12500 },
    { name: "Aurelia Homme Eau de Parfum", sub: "Men's Perfumes", price: 12500 },
    { name: "Ambre Nuit Unisex", sub: "Unisex Fragrances", price: 14000 },
    { name: "Royal Oud Intense", sub: "Oud", price: 19500 }]},
  "Home Decor": { slug: "home-decor", sizes: [], colors: ["Ivory", "Gold", "Sage"], items: [
    { name: "Hand-Blown Glass Vase", sub: "Decorative Vases", price: 6800 },
    { name: "Amber Soy Candle Trio", sub: "Candles", price: 4200 },
    { name: "Velvet Tufted Cushion Pair", sub: "Cushions", price: 5400 },
    { name: "Brass Table Centerpiece", sub: "Table Decor", price: 7900 }]},
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  const email = (process.env.ADMIN_EMAIL || "admin@aurelia.example").toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || "ChangeMe!12345";
  await prisma.user.upsert({ where: { email }, update: {}, create: { email, fullName: "AURELIA Admin", role: "ADMIN", passwordHash: await bcrypt.hash(pw, 12) } });

  let n = 0;
  for (const [catName, c] of Object.entries(CATS)) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { name: catName, slug: c.slug } });
    for (const [i, it] of c.items.entries()) {
      n++;
      const slug = slugify(it.name);
      const data = {
        name: it.name, slug, categoryId: cat.id, subcategory: it.sub,
        description: `${it.name} from the AURELIA ${catName} collection.`,
        price: it.price, salePrice: i % 4 === 1 ? Math.round((it.price * 0.85) / 100) * 100 : null,
        stock: 5 + ((n * 7) % 26), sku: `AUR-${slug.toUpperCase()}`,
        images: [PRODUCT_IMAGES[slug]], // AB NAAM SE SAHI PICTURE
        sizes: c.sizes, colors: c.colors,
        rating: Math.round((3.8 + ((n * 3) % 12) / 10) * 10) / 10, reviewCount: 4 + ((n * 5) % 40),
        featured: i < 2, bestSeller: i % 3 === 0,
        createdAt: new Date(Date.now() - n * 86_400_000),
      };
      await prisma.product.upsert({ where: { slug }, update: { ...data }, create: data });
    }
  }
  console.log(`Seeded ${n} products with CORRECT matched images`);
}
main().finally(() => prisma.$disconnect());