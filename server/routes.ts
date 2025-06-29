import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { setupSchema, loginSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const SETUP_PASSWORD = "dueuler2024";

  // Setup endpoint
  app.post("/api/setup", async (req, res) => {
    try {
      const data = setupSchema.parse(req.body);
      
      if (data.setupPassword !== SETUP_PASSWORD) {
        return res.status(401).json({ message: "Senha de configuração inválida" });
      }

      // Check if setup already completed
      const existingConfig = await storage.getSystemConfig();
      if (existingConfig?.setupCompleted) {
        return res.status(400).json({ message: "Sistema já foi configurado" });
      }

      // Create or update system configuration
      const config = existingConfig 
        ? await storage.updateSystemConfig({
            organizationName: data.organizationName,
            environment: data.environment,
            maxConcurrentUsers: data.maxConcurrentUsers,
            cacheTTL: data.cacheTTL,
            setupCompleted: true,
          })
        : await storage.createSystemConfig({
            organizationName: data.organizationName,
            environment: data.environment,
            maxConcurrentUsers: data.maxConcurrentUsers,
            cacheTTL: data.cacheTTL,
            setupCompleted: true,
          });

      // Create default admin user if none exists
      const adminUser = await storage.getUserByUsername("admin");
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await storage.createUser({
          username: "admin",
          password: hashedPassword,
          email: "admin@dueuler.com",
          role: "admin",
        });
      }

      res.json({ message: "Sistema configurado com sucesso", config });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Check setup status
  app.get("/api/setup/status", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      res.json({ setupCompleted: config?.setupCompleted || false });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (user.role !== data.role) {
        return res.status(403).json({ message: "Nível de acesso não autorizado" });
      }

      // Create session
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
      });

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        action: "login",
        description: `${user.username} fez login no sistema`,
      });

      res.json({
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        sessionId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Middleware to check authentication
  const authenticateUser = async (req: any, res: any, next: any) => {
    try {
      const sessionId = req.headers.authorization?.replace("Bearer ", "");
      if (!sessionId) {
        return res.status(401).json({ message: "Token de sessão requerido" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(401).json({ message: "Sessão inválida ou expirada" });
      }

      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Usuário inválido" });
      }

      req.user = user;
      req.sessionId = sessionId;
      next();
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };

  // Get current user
  app.get("/api/auth/me", authenticateUser, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  });

  // Get system metrics
  app.get("/api/metrics", authenticateUser, async (req: any, res) => {
    try {
      // Generate real-time metrics
      const activeSessionsCount = await storage.getActiveSessionsCount();
      const usersCount = (await storage.getAllUsers()).length;
      
      const metrics = [
        {
          label: "Usuários Online",
          value: activeSessionsCount.toString(),
          change: "+12.5%",
          icon: "users",
          trend: "up"
        },
        {
          label: "Taxa de Performance",
          value: "99.2%",
          change: "+0.3%",
          icon: "chart-line",
          trend: "up"
        },
        {
          label: "Cache Hit Rate",
          value: "94.8%",
          change: "-2.1%",
          icon: "memory",
          trend: "down"
        },
        {
          label: "Sessões Ativas",
          value: activeSessionsCount.toString(),
          change: "+8.7%",
          icon: "clock",
          trend: "up"
        }
      ];

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get users (admin only)
  app.get("/api/users", authenticateUser, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }));

      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create user (admin only)
  app.post("/api/users", authenticateUser, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const newUser = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        action: "create_user",
        description: `Criou usuário ${newUser.username}`,
      });

      res.json({
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get recent activity
  app.get("/api/activity", authenticateUser, async (req: any, res) => {
    try {
      const activities = await storage.getRecentActivity(10);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // System status
  app.get("/api/system/status", authenticateUser, async (req: any, res) => {
    try {
      const status = [
        { service: "API Gateway", status: "online", icon: "circle" },
        { service: "Base de Dados", status: "online", icon: "circle" },
        { service: "Cache Redis", status: "degraded", icon: "circle" },
        { service: "Backup System", status: "online", icon: "circle" }
      ];

      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
