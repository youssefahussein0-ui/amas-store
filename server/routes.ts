import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import bcrypt from "bcryptjs";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { insertProductSchema, insertCategorySchema, insertPromoCodeSchema } from "@shared/schema";
import { convertGoogleDriveLink } from "@shared/utils";
import { sendOrderConfirmation } from "./email";

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
  }
}

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({ pool, createTableIfMissing: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "amas-fallback-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    })
  );

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct({ 
        ...input, 
        price: String(input.price),
        discountPrice: input.discountPrice ? String(input.discountPrice) : null,
        imageUrl: convertGoogleDriveLink(input.imageUrl),
        additionalImages: input.additionalImages ? input.additionalImages.split(/[\n,]/).map(s => convertGoogleDriveLink(s.trim())).filter(Boolean).join(",") : null,
      });
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      const input = api.products.update.input.parse(req.body);
      const updates: Record<string, any> = { ...input };
      if (updates.price !== undefined) updates.price = String(updates.price);
      if (updates.discountPrice !== undefined) updates.discountPrice = updates.discountPrice ? String(updates.discountPrice) : null;
      if (updates.imageUrl !== undefined) updates.imageUrl = convertGoogleDriveLink(updates.imageUrl);
      if (updates.additionalImages !== undefined && updates.additionalImages !== null) {
        updates.additionalImages = updates.additionalImages.split(/[\n,]/).map(s => convertGoogleDriveLink(s.trim())).filter(Boolean).join(",");
      }
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });
      const product = await storage.updateProduct(id, updates as any);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });
    const deleted = await storage.deleteProduct(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
  });

  // Bulk CSV Upload
  app.post("/api/products/bulk", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const csvContent = req.file.buffer.toString("utf-8");
      let records: any[];
      try {
        records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
      } catch (e: any) {
        return res.status(400).json({ message: `CSV error: ${e.message}` });
      }
      const inserted: number[] = [];
      const errors: string[] = [];
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        try {
          const productData = {
            name: row.name, description: row.description, price: String(row.price),
            imageUrl: convertGoogleDriveLink(row.imageUrl), 
            category: row.category, stock: parseInt(row.stock) || 0,
            isNew: row.isNew === "true", isBestSeller: row.isBestSeller === "true",
            materials: row.materials || null,
            discountPrice: row.discountPrice ? String(row.discountPrice) : null,
            additionalImages: row.additionalImages ? row.additionalImages.split(/[\n,]/).map(s => convertGoogleDriveLink(s.trim())).filter(Boolean).join(",") : null,
          };
          insertProductSchema.parse(productData);
          const product = await storage.createProduct(productData);
          inserted.push(product.id);
        } catch (err: any) {
          errors.push(`Row ${i + 2}: ${err instanceof z.ZodError ? err.errors.map((e: any) => e.message).join(", ") : err.message}`);
        }
      }
      res.json({ inserted: inserted.length, errors });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    res.json(await storage.getCategories());
  });

  app.get(api.categories.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });
    const category = await storage.getCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  app.post(api.categories.create.path, async (req, res) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      const input = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({
        ...input,
        imageUrl: convertGoogleDriveLink(input.imageUrl)
      });
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.categories.update.path, async (req, res) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      const input = insertCategorySchema.partial().parse(req.body);
      if (input.imageUrl) input.imageUrl = convertGoogleDriveLink(input.imageUrl);
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });
      const category = await storage.updateCategory(id, input);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.categories.delete.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });
    const deleted = await storage.deleteCategory(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(204).send();
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getOrders());
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const allProducts = await storage.getProducts();
      
      let calculatedSubtotal = 0;
      const orderItemsToCreate = [];

      for (const item of input.items) {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        
        const itemPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
        calculatedSubtotal += itemPrice * item.quantity;
        
        orderItemsToCreate.push({
          ...item,
          price: String(itemPrice)
        });
      }

      let discountAmount = 0;
      let validPromoId = null;

      if (input.promoCode) {
        const promo = await storage.getPromoCodeByCode(input.promoCode);
        if (promo && promo.isActive) {
          const isValid = (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) && 
                          (!promo.maxUses || (promo.currentUses || 0) < promo.maxUses);
          if (isValid) {
            validPromoId = promo.id;
            if (promo.discountType === 'percentage') {
              discountAmount = (calculatedSubtotal * Number(promo.discountValue)) / 100;
            } else {
              discountAmount = Number(promo.discountValue);
            }
          }
        }
      }

      const order = await storage.createOrder(
        { 
          customerName: input.customerName, 
          customerPhone: input.customerPhone, 
          customerEmail: input.customerEmail || null,
          customerAddress: input.customerAddress, 
          city: input.city,
          street: input.street,
          building: input.building,
          apartment: input.apartment,
          floor: input.floor,
          specialInstructions: input.specialInstructions,
          paymentMethod: input.paymentMethod,
          transferPhone: input.transferPhone,
          promoCode: validPromoId ? input.promoCode : null,
          discountAmount: String(discountAmount),
          totalAmount: String(input.totalAmount) 
        },
        orderItemsToCreate
      );

      if (validPromoId) {
        await storage.incrementPromoCodeUsage(validPromoId);
      }
      
      for (const item of orderItemsToCreate) {
        await storage.decreaseProductStock(item.productId, item.quantity);
      }

      if (order.customerEmail) {
        // Send email asynchronously
        const itemsWithProducts = orderItemsToCreate.map(item => ({
          ...item,
          id: 0, orderId: order.id,
          product: allProducts.find(p => p.id === item.productId)!
        }));
        sendOrderConfirmation(order, itemsWithProducts as any).catch(console.error);
      }

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    try {
      if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
      const input = api.orders.updateStatus.input.parse(req.body);
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const order = await storage.updateOrderStatus(id, input.status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.orders.deleteAll.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteAllOrders();
    res.status(204).end();
  });

  app.delete(api.orders.delete.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
    const success = await storage.deleteOrder(id);
    if (!success) return res.status(404).json({ message: "Order not found" });
    res.status(204).end();
  });

  // --- Image Upload Route ---
  const diskStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop() || 'jpg';
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
  });
  
  const diskUpload = multer({ 
    storage: diskStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for images
  });

  app.post('/api/upload', diskUpload.single('image'), (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    
    // Return the URL for the uploaded file
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });

  // --- Google Drive Image Proxy Route ---
  app.get('/api/proxy-image', async (req, res) => {
    const id = req.query.id as string;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "Missing or invalid Google Drive file ID" });
    }

    try {
      const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      
      const response = await fetch(driveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Drive returned status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      if (contentType.includes('text/html')) {
        throw new Error('Google Drive redirected to an HTML page instead of serving the image');
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error(`[Proxy Image Error] Failed to proxy Google Drive image ${id}:`, error.message);
      res.status(500).json({ message: "Failed to load Google Drive image" });
    }
  });

  // Admin Auth
  app.post(api.admin.login.path, async (req: Request, res: Response) => {
    try {
      const input = api.admin.login.input.parse(req.body);
      const admin = await storage.getAdminByUsername(input.username);
      if (admin && await bcrypt.compare(input.password, admin.password)) {
        (req.session as any).adminAuthenticated = true;
        return res.json({ success: true });
      }
      res.status(401).json({ message: "Invalid credentials" });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(401).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.admin.logout.path, (req: Request, res: Response) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get(api.admin.checkAuth.path, (req: Request, res: Response) => {
    res.json({ authenticated: !!(req.session as any).adminAuthenticated });
  });

  app.get(api.admin.stats.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getAdminStats());
  });

  app.get(api.admin.leads.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getLeads());
  });

  app.delete(api.admin.clearLeads.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteAllLeads();
    res.status(204).end();
  });

  // Promo Codes
  app.get(api.promoCodes.list.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getPromoCodes());
  });

  app.post(api.promoCodes.validate.path, async (req, res) => {
    try {
      const { code } = api.promoCodes.validate.input.parse(req.body);
      const promo = await storage.getPromoCodeByCode(code);
      if (!promo) return res.status(404).json({ message: "Invalid promo code" });
      if (!promo.isActive) return res.status(400).json({ message: "Promo code is inactive" });
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return res.status(400).json({ message: "Promo code has expired" });
      if (promo.maxUses && promo.currentUses && promo.currentUses >= promo.maxUses) return res.status(400).json({ message: "Promo code usage limit reached" });
      res.json(promo);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.promoCodes.create.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    try {
      const body = { ...req.body };
      if (body.expiresAt) {
        body.expiresAt = new Date(body.expiresAt);
      }
      const parsed = insertPromoCodeSchema.parse(body);
      const promo = await storage.createPromoCode(parsed);
      res.status(201).json(promo);
    } catch (err: any) {
      console.error("Promo code create error:", err);
      res.status(400).json({ message: err.message || "Invalid promo code data" });
    }
  });

  app.patch(api.promoCodes.update.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    const promo = await storage.updatePromoCode(id, req.body);
    if (!promo) return res.status(404).json({ message: "Promo code not found" });
    res.json(promo);
  });

  app.delete(api.promoCodes.delete.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    const success = await storage.deletePromoCode(id);
    if (!success) return res.status(404).json({ message: "Promo code not found" });
    res.status(204).end();
  });

  // Site Settings
  app.get("/api/settings/:key", async (req, res) => {
    const value = await storage.getSetting(req.params.key);
    res.json({ key: req.params.key, value });
  });

  app.put("/api/settings/:key", async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const { value } = req.body;
    await storage.setSetting(req.params.key, String(value));
    res.json({ key: req.params.key, value: String(value) });
  });

  // Abandoned Carts
  app.get(api.abandonedCarts.list.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    res.json(await storage.getAbandonedCarts());
  });

  app.post(api.abandonedCarts.sync.path, async (req, res) => {
    const { sessionId, cartData, customerPhone, customerEmail } = api.abandonedCarts.sync.input.parse(req.body);
    const cart = await storage.upsertAbandonedCart(sessionId, cartData, customerPhone, customerEmail);
    res.json(cart);
  });

  // Reviews
  app.get(api.reviews.list.path, async (req, res) => {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const reviews = await storage.getReviews(productId);
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.reviews.delete.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    const success = await storage.deleteReview(id);
    if (!success) return res.status(404).json({ message: "Review not found" });
    res.status(204).end();
  });

  app.patch(api.reviews.approve.path, async (req, res) => {
    if (!(req.session as any).adminAuthenticated) return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    await storage.approveReview(id);
    res.json({ success: true });
  });

  // Analytics
  app.post(api.analytics.visit.path, async (req, res) => {
    try {
      const input = api.analytics.visit.input.parse(req.body);
      await storage.logSiteVisit(input.sessionId);
      res.status(204).end();
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.analytics.productView.path, async (req, res) => {
    try {
      const input = api.analytics.productView.input.parse(req.body);
      await storage.logProductView(input.productId, input.timeSpentSeconds);
      res.status(204).end();
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  try {
    const existingAdmin = await storage.getAdminByUsername("admin");
    if (!existingAdmin && process.env.ADMIN_PASSWORD) {
      await storage.createAdmin("admin", await bcrypt.hash(process.env.ADMIN_PASSWORD, 10));
      console.log("✅ Default admin created.");
    }
    const defaultCategories = [
      { slug: "Rings", nameEn: "Rings", nameAr: "خواتم", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b63f6e?w=800" },
      { slug: "Necklaces", nameEn: "Necklaces", nameAr: "قلادات", imageUrl: "https://images.unsplash.com/photo-1599643478524-fb66f72400ce?w=800" },
      { slug: "Bracelets", nameEn: "Bracelets", nameAr: "أساور", imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800" },
      { slug: "Earrings", nameEn: "Earrings", nameAr: "أقراط", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800" },
      { slug: "Clothing", nameEn: "Clothing", nameAr: "الملابس", imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800" },
      { slug: "Shoes", nameEn: "Shoes", nameAr: "الأحذية", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
    ];

    const currentCategories = await storage.getCategories();
    for (const cat of defaultCategories) {
      if (!currentCategories.find(c => c.slug === cat.slug)) {
        await storage.createCategory(cat);
        console.log(`✅ Category ${cat.nameEn} seeded.`);
      }
    }
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      const sampleProducts = [
        { name: "Elegant Gold Ring", description: "A beautiful handcrafted gold ring with intricate details.", price: "1200", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f66126e28?q=80&w=600&auto=format&fit=crop", category: "Rings", stock: 10, isNew: true, isBestSeller: true, materials: "18K Gold" },
        { name: "Pearl Drop Earrings", description: "Classic pearl earrings with a modern twist.", price: "850", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop", category: "Earrings", stock: 15, isNew: true, isBestSeller: false, materials: "Freshwater Pearls, Sterling Silver" },
        { name: "Diamond Pendant Necklace", description: "A stunning diamond pendant that captures the light from every angle.", price: "3500", imageUrl: "https://images.unsplash.com/photo-1599643478524-fb66f7ca265b?q=80&w=600&auto=format&fit=crop", category: "Necklaces", stock: 5, isNew: false, isBestSeller: true, materials: "Diamonds, 18K White Gold" },
        { name: "Minimalist Silver Bracelet", description: "A sleek and simple silver bracelet.", price: "450", imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop", category: "Bracelets", stock: 20, isNew: false, isBestSeller: false, materials: "Sterling Silver" },
      ];
      for (const p of sampleProducts) await storage.createProduct(p);
      console.log("✅ Sample products seeded.");
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}
