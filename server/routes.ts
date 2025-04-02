import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecentOrderSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  
  // Get order by order number
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const { orderNumber } = req.params;
      
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }
      
      const order = await storage.getOrderByOrderNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Add this order to recent orders
      await storage.addRecentOrder({
        orderNumber: order.orderNumber,
        viewedAt: new Date()
      });
      
      return res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid order data format", 
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to fetch order information"
      });
    }
  });
  
  // Get recently viewed orders
  app.get("/api/recent-orders", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentOrders = await storage.getRecentOrders(limit);
      return res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recent orders"
      });
    }
  });
  
  // Add recent order
  app.post("/api/recent-orders", async (req, res) => {
    try {
      const recentOrderData = insertRecentOrderSchema.parse(req.body);
      const recentOrder = await storage.addRecentOrder(recentOrderData);
      return res.status(201).json(recentOrder);
    } catch (error) {
      console.error("Error adding recent order:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid recent order data", 
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to add recent order"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
