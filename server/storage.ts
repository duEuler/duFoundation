import { 
  users, 
  sessions, 
  systemConfig, 
  systemMetrics, 
  activityLogs,
  type User, 
  type InsertUser,
  type Session,
  type InsertSession,
  type SystemConfig,
  type InsertSystemConfig,
  type SystemMetric,
  type InsertSystemMetric,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  getActiveSessionsCount(): Promise<number>;
  
  // System configuration
  getSystemConfig(): Promise<SystemConfig | undefined>;
  createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig>;
  updateSystemConfig(updates: Partial<SystemConfig>): Promise<SystemConfig | undefined>;
  
  // Metrics
  createMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getLatestMetrics(): Promise<SystemMetric[]>;
  
  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, id),
        gte(sessions.expiresAt, new Date())
      ));
    return session || undefined;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async getActiveSessionsCount(): Promise<number> {
    const result = await db
      .select()
      .from(sessions)
      .where(gte(sessions.expiresAt, new Date()));
    return result.length;
  }

  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const [config] = await db.select().from(systemConfig).limit(1);
    return config || undefined;
  }

  async createSystemConfig(config: InsertSystemConfig): Promise<SystemConfig> {
    const [newConfig] = await db
      .insert(systemConfig)
      .values({
        ...config,
        updatedAt: new Date(),
      })
      .returning();
    return newConfig;
  }

  async updateSystemConfig(updates: Partial<SystemConfig>): Promise<SystemConfig | undefined> {
    const [config] = await db
      .update(systemConfig)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .returning();
    return config || undefined;
  }

  async createMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const [newMetric] = await db
      .insert(systemMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  async getLatestMetrics(): Promise<SystemMetric[]> {
    return await db
      .select()
      .from(systemMetrics)
      .orderBy(desc(systemMetrics.timestamp))
      .limit(10);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
