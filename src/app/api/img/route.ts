export function GET(req: Request) {
  const u = new URL(req.url);
  const t = (u.searchParams.get("t") || "product").toLowerCase();
  const c = (u.searchParams.get("c") || "womens-fashion").toLowerCase();

  const IMAGES: Record<string, string[]> = {
    "womens-fashion": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
      "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae442",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    ],
    "mens-fashion": [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0",
    ],
    "jewelry": [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
    ],
    "footwear": [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772",
      "https://images.unsplash.com/photo-1560343090-f4df9e18b80e",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    ],
    "accessories": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      "https://images.unsplash.com/photo-1583622683112-7b800e1f12e6",
    ],
    "fragrances": [
      "https://images.unsplash.com/photo-1541643600914-78b084683601",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f",
      "https://images.unsplash.com/photo-1593487568720-92097fb460fb",
    ],
    "home-decor": [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
    ],
    // FIX: Added separate images for these slugs to prevent duplicate fallback
    "new-arrivals": [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    ],
    "best-sellers": [
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    ],
    "sale": [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    ],
    "all": [
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
    ]
  };

  // FIX 1: Prevent fallback to womens-fashion which causes duplicate images
  // If slug not found, pick a category deterministically based on slug name
  let list = IMAGES[c];
  if (!list) {
    const keys = Object.keys(IMAGES);
    // Generate hash from category name to pick a different category
    let cHash = 0;
    for(let i=0; i<c.length; i++) cHash += c.charCodeAt(i);
    list = IMAGES[keys[cHash % keys.length]];
  }
  
  // FIX 2: Include category name in hash to avoid same image for same product title in different categories
  let hash = t.length * 7 + c.length * 13;
  for (let i = 0; i < t.length; i++) {
    hash += t.charCodeAt(i) * (i + 1);
  }
  for (let i = 0; i < c.length; i++) {
    hash += c.charCodeAt(i) * (i + 3);
  }
  
  const imgUrl = list[hash % list.length] + "?w=600&h=800&fit=crop&auto=format&q=80";

  return Response.redirect(imgUrl, 302);
}
