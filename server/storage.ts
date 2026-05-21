import { db } from "./db";
import { products, orders, orderItems, adminUsers, categories, leads, siteVisits, promoCodes, abandonedCarts, reviews, siteSettings, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type OrderWithItems, type AdminUser, type Category, type InsertCategory, type Lead, type InsertLead, type PromoCode, type InsertPromoCode, type AbandonedCart, type InsertAbandonedCart, type Review, type InsertReview } from "@shared/schema";
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
  decreaseProductStock(productId: number, quantity: number): Promise<void>;
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

  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  incrementPromoCodeUsage(id: number): Promise<void>;

  getAbandonedCarts(): Promise<AbandonedCart[]>;
  upsertAbandonedCart(sessionId: string, cartData: string, customerPhone?: string, customerEmail?: string): Promise<AbandonedCart>;
  markCartRecovered(sessionId: string): Promise<void>;

  getReviews(productId?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  approveReview(id: number): Promise<void>;

  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
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
          return { 
            ...item, 
            product: product || { 
              id: item.productId, 
              name: "Deleted Product", 
              description: "", 
              price: String(item.price), 
              imageUrl: "", 
              category: "Deleted", 
              stock: 0, 
              isNew: false, 
              isBestSeller: false, 
              materials: null, 
              discountPrice: null, 
              additionalImages: null, 
              sizes: null, 
              colors: null, 
              views: 0, 
              timeSpent: 0, 
              createdAt: null 
            } 
          };
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

  async decreaseProductStock(productId: number, quantity: number): Promise<void> {
    await db.update(products)
      .set({ stock: sql`${products.stock} - ${quantity}` })
      .where(eq(products.id, productId));
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

    // Calculate daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = allOrders.filter(o => o.createdAt?.toISOString().split('T')[0] === dateStr);
      const dayRevenue = dayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      
      dailyStats.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayRevenue
      });
    }

    return {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      totalProducts: allProducts.length,
      totalVisits: allVisits.length,
      mostViewedProducts,
      bestSellingProducts,
      dailyStats
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

  // Phase 2: Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
    return promo;
  }

  async createPromoCode(insertPromo: InsertPromoCode): Promise<PromoCode> {
    const [promo] = await db.insert(promoCodes).values(insertPromo).returning();
    return promo;
  }

  async updatePromoCode(id: number, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [promo] = await db.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
    return promo;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    const [deleted] = await db.delete(promoCodes).where(eq(promoCodes.id, id)).returning();
    return !!deleted;
  }

  async incrementPromoCodeUsage(id: number): Promise<void> {
    await db.update(promoCodes)
      .set({ currentUses: sql`${promoCodes.currentUses} + 1` })
      .where(eq(promoCodes.id, id));
  }

  // Phase 2: Abandoned Carts
  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    return await db.select().from(abandonedCarts).orderBy(desc(abandonedCarts.lastActive));
  }

  async upsertAbandonedCart(sessionId: string, cartData: string, customerPhone?: string, customerEmail?: string): Promise<AbandonedCart> {
    const [existing] = await db.select().from(abandonedCarts).where(eq(abandonedCarts.sessionId, sessionId));
    if (existing) {
      const [updated] = await db.update(abandonedCarts).set({
        cartData,
        customerPhone: customerPhone || existing.customerPhone,
        customerEmail: customerEmail || existing.customerEmail,
        lastActive: new Date()
      }).where(eq(abandonedCarts.sessionId, sessionId)).returning();
      return updated;
    } else {
      const [inserted] = await db.insert(abandonedCarts).values({
        sessionId,
        cartData,
        customerPhone,
        customerEmail,
        lastActive: new Date()
      }).returning();
      return inserted;
    }
  }

  async markCartRecovered(sessionId: string): Promise<void> {
    await db.update(abandonedCarts).set({ recovered: true }).where(eq(abandonedCarts.sessionId, sessionId));
  }

  // Phase 3: Reviews
  async getReviews(productId?: number): Promise<Review[]> {
    if (productId) {
      return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
    }
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return !!deleted;
  }

  async approveReview(id: number): Promise<void> {
    await db.update(reviews).set({ isApproved: true }).where(eq(reviews.id, id));
  }

  async getSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return row?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    if (existing) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value });
    }
  }
}

export const storage = new DatabaseStorage();
