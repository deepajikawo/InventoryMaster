import { User, InsertUser, Product, InsertProduct, Inventory, InsertInventory } from "@shared/schema";
import { users, products, inventory } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface ListProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  listUsers(): Promise<User[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  listProducts(options?: ListProductsOptions): Promise<Product[]>;

  // Inventory operations
  createInventoryTransaction(transaction: InsertInventory): Promise<Inventory>;
  getProductStock(productId: number): Promise<number>;
  listInventoryTransactions(): Promise<Inventory[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...insertProduct,
      description: insertProduct.description ?? null,
    }).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async listProducts(options: ListProductsOptions = {}): Promise<Product[]> {
    const { page = 1, limit = 10, search = '', category = '' } = options;
    const offset = (page - 1) * limit;

    let query = db.select().from(products);

    if (search) {
      query = query.where(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.description || '', `%${search}%`)
        )
      );
    }

    if (category) {
      query = query.where(eq(products.category, category));
    }

    return await query.limit(limit).offset(offset);
  }

  // Inventory operations
  async createInventoryTransaction(insertTransaction: InsertInventory): Promise<Inventory> {
    const [transaction] = await db.insert(inventory).values({
      ...insertTransaction,
      description: insertTransaction.description ?? null,
    }).returning();
    return transaction;
  }

  async getProductStock(productId: number): Promise<number> {
    const transactions = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId));

    return transactions.reduce(
      (sum, t) => sum + (t.type === "IN" ? t.quantity : -t.quantity),
      0
    );
  }

  async listInventoryTransactions(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }
}

export const storage = new DatabaseStorage();