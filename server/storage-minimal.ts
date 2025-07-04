import { 
  users, 
  systemConfig, 
  type User, 
  type InsertUser,
  type SystemConfig,
  type InsertSystemConfig
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // System configuration  
  getSystemConfig(): Promise<SystemConfig | undefined>;
  createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig>;
  updateSystemConfig(updates: Partial<SystemConfig>): Promise<SystemConfig | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const result = await db.select().from(systemConfig).limit(1);
    return result[0];
  }

  async createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig> {
    const result = await db.insert(systemConfig).values(config).returning();
    return result[0];
  }

  async updateSystemConfig(updates: Partial<SystemConfig>): Promise<SystemConfig | undefined> {
    const result = await db.update(systemConfig).set(updates).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();