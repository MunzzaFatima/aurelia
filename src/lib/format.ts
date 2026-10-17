export const pkr = (n: number) => "PKR " + n.toLocaleString("en-PK");
export const FREE_SHIPPING_OVER = 15000;
export const SHIPPING_FLAT = 500;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT);
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }).format(d);
export const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
