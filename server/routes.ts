import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertInventorySchema } from "@shared/schema";
import { ZodError } from "zod";

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
    const products = await storage.listProducts();
    res.json(products);
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
        throw e;
      }
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(200);
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
        createdBy: req.user.id,
      });
      const created = await storage.createInventoryTransaction(transaction);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
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
