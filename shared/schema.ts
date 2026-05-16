import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  isNew: boolean("is_new").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  materials: text("materials"),
  discountPrice: numeric("discount_price"),
  additionalImages: text("additional_images"), // JSON array of strings
  sizes: text("sizes"), // JSON array of strings or comma-separated
  colors: text("colors"), // JSON array of strings or comma-separated
  views: integer("views").default(0),
  timeSpent: integer("time_spent").default(0), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address"), // Legacy/combined address
  city: text("city"),
  street: text("street"),
  building: text("building"),
  apartment: text("apartment"),
  floor: text("floor"),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash_on_delivery, instapay, vodafone_cash, card
  transferPhone: text("transfer_phone"),
  paymentReceiptUrl: text("payment_receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  size: text("size"),
  color: text("color"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  imageUrl: text("image_url").notNull(),
  hasSizes: boolean("has_sizes").default(false),
  hasColors: boolean("has_colors").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  prize: text("prize").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const siteVisits = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSiteVisitSchema = createInsertSchema(siteVisits).omit({ id: true, createdAt: true });
export type SiteVisit = typeof siteVisits.$inferSelect;
export type InsertSiteVisit = z.infer<typeof insertSiteVisitSchema>;
