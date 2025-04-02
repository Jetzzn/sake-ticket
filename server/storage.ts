import {
  users,
  type User,
  type InsertUser,
  orders,
  type Order,
  type InsertOrder,
  recentOrders,
  type RecentOrder,
  type InsertRecentOrder
} from "@shared/schema";
import { fetchOrderFromAirtable } from "./airtable";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Recent orders methods
  getRecentOrders(limit?: number): Promise<RecentOrder[]>;
  addRecentOrder(recentOrder: InsertRecentOrder): Promise<RecentOrder>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private recentOrders: RecentOrder[];
  userCurrentId: number;
  orderCurrentId: number;
  recentOrderCurrentId: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.recentOrders = [];
    this.userCurrentId = 1;
    this.orderCurrentId = 1;
    this.recentOrderCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    // First, check our in-memory storage
    const existingOrder = Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber
    );

    if (existingOrder) {
      return existingOrder;
    }

    // If the order doesn't exist in memory, fetch it from Airtable
    try {
      const airtableOrder = await fetchOrderFromAirtable(orderNumber);
      
      if (airtableOrder) {
        // Store the order in memory for future requests
        const id = this.orderCurrentId++;
        const order: Order = { ...airtableOrder, id };
        this.orders.set(id, order);
        return order;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error fetching order ${orderNumber} from Airtable:`, error);
      throw error;
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const order: Order = { ...insertOrder, id };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, orderUpdate: Partial<InsertOrder>): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return undefined;
    }

    const updatedOrder: Order = { ...existingOrder, ...orderUpdate };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Recent orders methods
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    // Sort by viewedAt in descending order (most recent first) and limit
    return this.recentOrders
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);
  }

  async addRecentOrder(insertRecentOrder: InsertRecentOrder): Promise<RecentOrder> {
    const id = this.recentOrderCurrentId++;
    const recentOrder: RecentOrder = { ...insertRecentOrder, id };
    
    // Remove existing entries with the same order number
    this.recentOrders = this.recentOrders.filter(
      order => order.orderNumber !== insertRecentOrder.orderNumber
    );
    
    // Add the new recent order
    this.recentOrders.push(recentOrder);
    
    // Limit the list to the most recent 10 orders
    if (this.recentOrders.length > 10) {
      this.recentOrders.sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());
      this.recentOrders = this.recentOrders.slice(0, 10);
    }
    
    return recentOrder;
  }
}

export const storage = new MemStorage();
