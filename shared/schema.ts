import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shop details schema
export const shopDetailsSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact is required"),
  gst: z.string().optional(),
});

export type ShopDetails = z.infer<typeof shopDetailsSchema>;

// Inventory item schema
export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  price: z.number().positive("Price must be greater than 0"),
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

// Complete bill schema
export const billSchema = z.object({
  id: z.string(),
  customer: z.string(),
  date: z.string(),
  items: z.array(billItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
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
