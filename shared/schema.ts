import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep the users table as it might be needed for the application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Add order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  totalPrice: text("total_price").notNull(),
  orderItemsSummary: jsonb("order_items_summary").notNull(),
  orderStatus: text("order_status").default("FINALIZED"),
  paymentStatus: text("payment_status").default("NO_PAYMENT"),
  receiptLink: text("receipt_link"),
  remark: text("remark"),
  airtableId: text("airtable_id").notNull().unique(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

// Add schema for recently viewed orders
export const recentOrders = pgTable("recent_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export const insertRecentOrderSchema = createInsertSchema(recentOrders).omit({
  id: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type RecentOrder = typeof recentOrders.$inferSelect;
export type InsertRecentOrder = z.infer<typeof insertRecentOrderSchema>;

// Define Order-related types for frontend usage
export type OrderItem = {
  productName: string;
  sku: string;
  quantity: number;
  price: string;
  total: string;
};

export type TrackingUpdate = {
  status: string;
  date: string;
  timestamp: string;
  icon: string;
};
