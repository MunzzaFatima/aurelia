import { z } from "zod";
export const checkoutSchema = z.object({
  idempotencyKey: z.string().min(8).max(64),
  customerName: z.string().trim().min(2, "Enter your full name").max(80),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^(\+92|0)?3\d{9}$|^\+?\d{10,14}$/, "Enter a valid phone number"),
  country: z.string().trim().min(2, "Enter your country"),
  province: z.string().trim().min(2, "Enter your province or state"),
  city: z.string().trim().min(2, "Enter your city"),
  address: z.string().trim().min(8, "Enter your complete delivery address").max(300),
  landmark: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(12).optional(),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(10), size: z.string().optional(), color: z.string().optional() })).min(1, "Your bag is empty").max(30),
});
