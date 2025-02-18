import { User, InsertUser, Product, InsertProduct, Inventory, InsertInventory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  listProducts(): Promise<Product[]>;

  // Inventory operations
  createInventoryTransaction(transaction: InsertInventory): Promise<Inventory>;
  getProductStock(productId: number): Promise<number>;
  listInventoryTransactions(): Promise<Inventory[]>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private inventory: Map<number, Inventory>;
  private currentUserId: number = 1;
  private currentProductId: number = 1;
  private currentInventoryId: number = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.users = new Map();
    this.products = new Map();
    this.inventory = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: this.users.size === 0 // First user is admin
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async listProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createInventoryTransaction(insertTransaction: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const transaction: Inventory = { 
      ...insertTransaction,
      id,
      createdAt: new Date()
    };
    this.inventory.set(id, transaction);
    return transaction;
  }

  async getProductStock(productId: number): Promise<number> {
    return Array.from(this.inventory.values())
      .filter(t => t.productId === productId)
      .reduce((sum, t) => sum + (t.type === 'IN' ? t.quantity : -t.quantity), 0);
  }

  async listInventoryTransactions(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }
}

export const storage = new MemStorage();
