import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shop details schema
export const shopDetailsSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gst: z.string().optional(),
  logo: z.string().optional(),
  currency: z.string().default("$"),
  footerText: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(10),
  theme: z.enum(["light", "dark", "blue", "green", "purple"]).default("light"),
});

export type ShopDetails = z.infer<typeof shopDetailsSchema>;

// Category schema for inventory items
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  color: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;

// Inventory item schema with enhanced details
export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  unit: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

// Bill item schema (item in a bill)
export const billItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  total: z.number().positive(),
});

export type BillItem = z.infer<typeof billItemSchema>;

// Payment method enum
export const paymentMethodEnum = z.enum([
  "cash", 
  "credit_card", 
  "debit_card", 
  "bank_transfer", 
  "check", 
  "online_payment",
  "other"
]);

export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

// Complete bill schema
export const billSchema = z.object({
  id: z.string(),
  customer: z.string(),
  date: z.string(),
  items: z.array(billItemSchema),
  subtotal: z.number().positive(),
  discountType: z.enum(["none", "percentage", "fixed"]).default("none"),
  discountValue: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).default(10),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
  paymentMethod: paymentMethodEnum.default("cash"),
  notes: z.string().optional(),
  isPaid: z.boolean().default(false),
});

export type Bill = z.infer<typeof billSchema>;

// Keep the users table for compatibility with the rest of the code
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
