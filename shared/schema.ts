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
  status: text("status").notNull(),
  orderDate: timestamp("order_date").notNull(),
  customerName: text("customer_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  trackingNumber: text("tracking_number"),
  subtotal: text("subtotal").notNull(),
  shipping: text("shipping").notNull(),
  tax: text("tax").notNull(),
  total: text("total").notNull(),
  items: jsonb("items").notNull(),
  trackingUpdates: jsonb("tracking_updates"),
  airtableId: text("airtable_id").notNull().unique(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

// Add schema for recently viewed orders
export const recentOrders = pgTable("recent_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull(),
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
