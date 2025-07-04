import { pgTable, serial, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  foundationCapacity: varchar("foundation_capacity", { length: 50 }).notNull(),
  maxConcurrentUsers: integer("max_concurrent_users").notNull(),
  cacheTTL: integer("cache_ttl").notNull(),
  setupCompleted: boolean("setup_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).default("user"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const setupSchema = z.object({
  setupPassword: z.string().min(1),
  organizationName: z.string().min(2),
  environment: z.enum(["development", "staging", "production"]),
  foundationCapacity: z.string().min(1),
  maxConcurrentUsers: z.number().min(1),
  cacheTTL: z.number().min(60),
  adminUsername: z.string().min(3),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SetupRequest = z.infer<typeof setupSchema>;