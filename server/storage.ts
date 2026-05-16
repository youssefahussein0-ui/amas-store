import { db } from "./db";
import { products, orders, orderItems, adminUsers, categories, leads, siteVisits, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type OrderWithItems, type AdminUser, type Category, type InsertCategory, type Lead, type InsertLead } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getOrders(): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder, items: {productId: number, quantity: number, price: string | number, size?: string | null, color?: string | null}[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getAdminStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalVisits: number;
    mostViewedProducts: Product[];
    bestSellingProducts: (Product & { totalSold: number; totalRevenue: number })[];
  }>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(username: string, hashedPassword: string): Promise<AdminUser>;
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  deleteAllOrders(): Promise<void>;
  deleteAllLeads(): Promise<void>;
  logSiteVisit(sessionId: string): Promise<void>;
  logProductView(productId: number, timeSpentSeconds: number): Promise<void>;
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
        .map(item => {
          const product = allProducts.find(p => p.id === item.productId);
          return { ...item, product: product! };
        })
    }));
  }

  async createOrder(insertOrder: InsertOrder, items: {productId: number, quantity: number, price: string | number, size?: string | null, color?: string | null}[]): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    for (const item of items) {
      await db.insert(orderItems).values({ 
        orderId: order.id, 
        productId: item.productId, 
        quantity: item.quantity, 
        price: String(item.price),
        size: item.size || null,
        color: item.color || null
      });
    }
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async deleteOrder(id: number): Promise<boolean> {
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning();
    return !!deleted;
  }

  async getAdminStats() {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allVisits = await db.select().from(siteVisits);
    const allOrderItems = await db.select().from(orderItems);

    // Calculate best-selling products
    const productSales = new Map<number, { totalSold: number; totalRevenue: number }>();
    allOrderItems.forEach((item) => {
      const current = productSales.get(item.productId) || { totalSold: 0, totalRevenue: 0 };
      productSales.set(item.productId, {
        totalSold: current.totalSold + item.quantity,
        totalRevenue: current.totalRevenue + (Number(item.price) * item.quantity),
      });
    });

    const bestSellingProducts = allProducts
      .map((p) => ({
        ...p,
        totalSold: productSales.get(p.id)?.totalSold || 0,
        totalRevenue: productSales.get(p.id)?.totalRevenue || 0,
      }))
      .filter((p) => p.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const mostViewedProducts = [...allProducts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    return {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      totalProducts: allProducts.length,
      totalVisits: allVisits.length,
      mostViewedProducts,
      bestSellingProducts,
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

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return !!deleted;
  }
  
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async deleteAllOrders(): Promise<void> {
    await db.delete(orderItems);
    await db.delete(orders);
  }

  async deleteAllLeads(): Promise<void> {
    await db.delete(leads);
  }

  async logSiteVisit(sessionId: string): Promise<void> {
    await db.insert(siteVisits).values({ sessionId });
  }

  async logProductView(productId: number, timeSpentSeconds: number): Promise<void> {
    await db.update(products)
      .set({
        views: sql`${products.views} + 1`,
        timeSpent: sql`${products.timeSpent} + ${timeSpentSeconds}`,
      })
      .where(eq(products.id, productId));
  }
}

export const storage = new DatabaseStorage();
