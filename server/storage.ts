import { db } from "./db";
import { products, orders, orderItems, adminUsers, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type OrderWithItems, type AdminUser } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getOrders(): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder, items: {productId: number, quantity: number, price: string | number}[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getAdminStats(): Promise<{totalOrders: number, totalRevenue: number, totalProducts: number}>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(username: string, hashedPassword: string): Promise<AdminUser>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    return !!deleted;
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allOrderItems = await db.select().from(orderItems);
    const allProducts = await db.select().from(products);
    return allOrders.map(order => ({
      ...order,
      items: allOrderItems
        .filter(item => item.orderId === order.id)
        .map(item => ({ ...item, product: allProducts.find(p => p.id === item.productId)! }))
    }));
  }

  async createOrder(insertOrder: InsertOrder, items: {productId: number, quantity: number, price: string | number}[]): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    for (const item of items) {
      await db.insert(orderItems).values({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: String(item.price) });
    }
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getAdminStats(): Promise<{totalOrders: number, totalRevenue: number, totalProducts: number}> {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    return {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      totalProducts: allProducts.length,
    };
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdmin(username: string, hashedPassword: string): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values({ username, password: hashedPassword }).returning();
    return admin;
  }
}

export const storage = new DatabaseStorage();
