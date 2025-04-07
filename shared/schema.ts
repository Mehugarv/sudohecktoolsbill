import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shop details schema - Enhanced with more fields
export const shopDetailsSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  tagline: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  contact: z.string().min(1, "Contact is required"),
  alternateContact: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gst: z.string().optional(),
  pan: z.string().optional(),
  businessType: z.string().optional(),
  registrationNumber: z.string().optional(),
  logo: z.string().optional(),
  currency: z.string().default("$"),
  footerText: z.string().optional(),
  termsAndConditions: z.string().optional(),
  bankDetails: z.string().optional(),
  invoicePrefix: z.string().optional(),
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

// Inventory item schema with more detailed fields
export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  costPrice: z.number().nonnegative().optional(), // Added cost price for profit tracking
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  minStockLevel: z.number().int().nonnegative().optional(), // For low stock alerts
  unit: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(), // Item-specific tax rate
  discount: z.number().min(0).max(100).optional(), // Default discount percentage
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isService: z.boolean().default(false), // Distinguish between products and services
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  expiryDate: z.string().optional(),
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

// Customer schema with detailed fields
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  company: z.string().optional(),
  gst: z.string().optional(),
  pan: z.string().optional(),
  customerType: z.enum(["individual", "business"]).default("individual"),
  notes: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

// Complete bill schema with enhanced customer and timestamp
export const billSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().optional(),
  customer: customerSchema,
  date: z.string(),
  createdAt: z.string(), // Exact timestamp for bill generation
  dueDate: z.string().optional(),
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
  termsAndConditions: z.string().optional(),
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
