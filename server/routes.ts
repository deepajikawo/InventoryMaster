import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertInventorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "./uploadthing";

// Extend Express.Request to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      isAdmin: boolean;
    }
  }
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(403);
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Add uploadthing route
  app.use("/api/uploadthing", createRouteHandler({
    router: uploadRouter,
    config: { isDev: process.env.NODE_ENV === "development" }
  }));

  // User management (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.listUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.sendStatus(200);
  });

  // Product management (admin only)
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', category = '' } = req.query;
      const products = await storage.listProducts({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        category: String(category)
      });
      res.json(products);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const created = await storage.createProduct(product);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(Number(req.params.id), updates);
      res.json(updated);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ error: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.sendStatus(200);
    } catch (e) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Inventory management
  app.get("/api/inventory", requireAuth, async (req, res) => {
    const transactions = await storage.listInventoryTransactions();
    res.json(transactions);
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    try {
      const transaction = insertInventorySchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const created = await storage.createInventoryTransaction(transaction);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  app.get("/api/products/:id/stock", requireAuth, async (req, res) => {
    const stock = await storage.getProductStock(Number(req.params.id));
    res.json({ stock });
  });

  const httpServer = createServer(app);
  return httpServer;
}