import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-minimal";
import bcrypt from "bcrypt";
import { setupSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const SETUP_PASSWORD = "dueuler2024";

  // Setup endpoint - only route available in virgin system
  app.post("/api/setup", async (req, res) => {
    try {
      // Check if system already configured
      const existingConfig = await storage.getSystemConfig();
      if (existingConfig?.setupCompleted) {
        return res.status(400).json({ error: "Sistema já foi configurado" });
      }

      // Validate setup password
      const { setupPassword, ...setupData } = setupSchema.parse(req.body);
      if (setupPassword !== SETUP_PASSWORD) {
        return res.status(401).json({ error: "Senha de setup incorreta" });
      }

      // Create admin user
      const { adminUsername, adminEmail, adminPassword, ...configData } = setupData;
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = await storage.createUser({
        username: adminUsername,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
        isActive: true
      });

      // Create system configuration
      const systemConfig = await storage.createSystemConfig({
        ...configData,
        setupCompleted: true
      });

      res.json({ 
        success: true, 
        message: "Foundation configurado com sucesso!",
        config: systemConfig,
        adminUser: { id: adminUser.id, username: adminUser.username, email: adminUser.email }
      });

      // Here the system would trigger the loading of full foundation components
      console.log("🎉 Foundation Setup Complete - Ready to load full system");
      
    } catch (error) {
      console.error("Setup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      mode: "virgin",
      message: "DuEuler Foundation - Setup Required",
      timestamp: new Date().toISOString()
    });
  });

  // Status endpoint to check if setup is complete
  app.get("/api/status", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      res.json({
        setupCompleted: !!config?.setupCompleted,
        organizationName: config?.organizationName || null,
        foundationCapacity: config?.foundationCapacity || null
      });
    } catch (error) {
      res.json({ setupCompleted: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}