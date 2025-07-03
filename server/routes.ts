import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { setupSchema, loginSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { monitoringService, createMonitoringMiddleware } from "./monitoring";
import { getFoundationConfig, validateCapacityForUsers, suggestCapacityForUsers, FOUNDATION_CONFIGS } from "./foundation-config";

export async function registerRoutes(app: Express): Promise<Server> {
  const SETUP_PASSWORD = "dueuler2024";
  
  // Apply monitoring middleware to all routes
  app.use(createMonitoringMiddleware(monitoringService));

  // Setup endpoint
  app.post("/api/setup", async (req, res) => {
    try {
      const data = setupSchema.parse(req.body);
      
      if (data.setupPassword !== SETUP_PASSWORD) {
        return res.status(401).json({ message: "Senha de configuração inválida" });
      }

      // Validate Foundation capacity for configured users
      if (!validateCapacityForUsers(data.foundationCapacity, data.maxConcurrentUsers)) {
        const suggestedCapacity = suggestCapacityForUsers(data.maxConcurrentUsers);
        const capacityConfig = getFoundationConfig(suggestedCapacity);
        return res.status(400).json({ 
          message: `Capacidade ${data.foundationCapacity} não suporta ${data.maxConcurrentUsers} usuários. Recomendamos: ${suggestedCapacity} (${capacityConfig.userRange.min}-${capacityConfig.userRange.max} usuários)` 
        });
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
            foundationCapacity: data.foundationCapacity,
            maxConcurrentUsers: data.maxConcurrentUsers,
            cacheTTL: data.cacheTTL,
            setupCompleted: true,
          })
        : await storage.createSystemConfig({
            organizationName: data.organizationName,
            environment: data.environment,
            foundationCapacity: data.foundationCapacity,
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

      // User role is determined by their account, no need to validate role in login

      // Create session
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
      });

      // Update monitoring service with new user session
      monitoringService.recordUserSession(1);

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
        // Update monitoring service to decrease user session count
        monitoringService.recordUserSession(-1);
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

  // Get system metrics (duEuler Foundation v3.0 integration)
  app.get("/api/metrics", authenticateUser, async (req: any, res) => {
    try {
      const activeSessionsCount = await storage.getActiveSessionsCount();
      const usersCount = (await storage.getAllUsers()).length;
      const systemMetrics = monitoringService.getLatestMetrics();
      
      // Real-time metrics from duEuler Foundation monitoring
      const metrics = [
        {
          label: "Usuários Online",
          value: systemMetrics.user_sessions.toString(),
          change: "+12.5%",
          icon: "users",
          trend: "up"
        },
        {
          label: "Taxa de Performance",
          value: `${Math.max(0, 100 - (systemMetrics.response_time_avg / 10)).toFixed(1)}%`,
          change: systemMetrics.response_time_avg < 100 ? "+0.3%" : "-0.8%",
          icon: "chart-line",
          trend: systemMetrics.response_time_avg < 100 ? "up" : "down"
        },
        {
          label: "Uso de CPU",
          value: `${systemMetrics.cpu_usage.toFixed(1)}%`,
          change: systemMetrics.cpu_usage < 70 ? "-2.1%" : "+5.2%",
          icon: "cpu",
          trend: systemMetrics.cpu_usage < 70 ? "down" : "up"
        },
        {
          label: "Conexões Ativas",
          value: systemMetrics.active_connections.toString(),
          change: "+8.7%",
          icon: "activity",
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

  // System status (duEuler Foundation v3.0 integration)
  app.get("/api/system/status", authenticateUser, async (req: any, res) => {
    try {
      const healthStatus = monitoringService.getHealthStatus();
      const systemMetrics = monitoringService.getLatestMetrics();
      
      const status = [
        { 
          service: "API Gateway", 
          status: healthStatus.status === 'healthy' ? "online" : healthStatus.status, 
          icon: "circle",
          details: `Response time: ${systemMetrics.response_time_avg.toFixed(2)}ms`
        },
        { 
          service: "Base de Dados", 
          status: "online", 
          icon: "circle",
          details: `Connections: ${systemMetrics.active_connections}`
        },
        { 
          service: "Sistema de Monitoramento", 
          status: "online", 
          icon: "circle",
          details: `CPU: ${systemMetrics.cpu_usage.toFixed(1)}%`
        },
        { 
          service: "Sessões de Usuário", 
          status: systemMetrics.user_sessions > 8000 ? "degraded" : "online", 
          icon: "circle",
          details: `Active: ${systemMetrics.user_sessions}/10000`
        }
      ];

      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // duEuler Foundation v3.0 monitoring endpoints
  app.get("/api/monitoring/health", (req, res) => {
    try {
      const health = monitoringService.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter status de saúde" });
    }
  });

  app.get("/api/monitoring/metrics", authenticateUser, (req: any, res) => {
    try {
      const metrics = monitoringService.getLatestMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter métricas" });
    }
  });

  app.get("/api/monitoring/prometheus", (req, res) => {
    try {
      const prometheusMetrics = monitoringService.exportPrometheusMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(prometheusMetrics);
    } catch (error) {
      res.status(500).json({ message: "Erro ao exportar métricas Prometheus" });
    }
  });

  app.get("/api/monitoring/metrics/:name/history", authenticateUser, (req: any, res) => {
    try {
      const { name } = req.params;
      const timeRange = parseInt(req.query.timeRange as string) || 3600000; // 1 hour default
      const history = monitoringService.getMetricsHistory(name, timeRange);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter histórico de métricas" });
    }
  });

  // duEuler Foundation v3.0 configuration endpoints
  app.get("/api/foundation/config", authenticateUser, async (req: any, res) => {
    try {
      const systemConfig = await storage.getSystemConfig();
      if (!systemConfig) {
        return res.status(404).json({ message: "Configuração do sistema não encontrada" });
      }
      
      const foundationConfig = getFoundationConfig(systemConfig.foundationCapacity);
      res.json({
        systemConfig,
        foundationConfig,
        currentCapacity: systemConfig.foundationCapacity
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter configuração da Foundation" });
    }
  });

  app.get("/api/foundation/capacities", (req, res) => {
    try {
      const capacities = Object.entries(FOUNDATION_CONFIGS).map(([key, config]: [string, any]) => ({
        key,
        name: config.capacity,
        description: config.description,
        userRange: config.userRange,
        useCases: config.useCases,
        resources: config.resources
      }));
      
      res.json(capacities);
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter capacidades da Foundation" });
    }
  });

  // Reconfigure Foundation capacity
  app.post("/api/foundation/reconfigure", authenticateUser, async (req: any, res) => {
    try {
      const { foundationCapacity, maxConcurrentUsers } = req.body;
      
      if (!foundationCapacity) {
        return res.status(400).json({ message: "Capacidade da Foundation é obrigatória" });
      }

      // Validate Foundation capacity for configured users
      if (maxConcurrentUsers && !validateCapacityForUsers(foundationCapacity, maxConcurrentUsers)) {
        const suggestedCapacity = suggestCapacityForUsers(maxConcurrentUsers);
        const capacityConfig = getFoundationConfig(suggestedCapacity);
        return res.status(400).json({ 
          message: `Capacidade ${foundationCapacity} não suporta ${maxConcurrentUsers} usuários. Recomendamos: ${suggestedCapacity} (${capacityConfig.userRange.min}-${capacityConfig.userRange.max} usuários)` 
        });
      }

      // Update only Foundation configuration
      const systemConfig = await storage.getSystemConfig();
      if (!systemConfig) {
        return res.status(404).json({ message: "Configuração do sistema não encontrada" });
      }

      const updateData: any = { foundationCapacity };
      if (maxConcurrentUsers) {
        updateData.maxConcurrentUsers = maxConcurrentUsers;
      }

      const updatedConfig = await storage.updateSystemConfig(updateData);
      const foundationConfig = getFoundationConfig(foundationCapacity);

      // Log the reconfiguration
      await storage.createActivityLog({
        userId: req.user.id,
        action: "foundation_reconfigure",
        description: `Capacidade da Foundation alterada para ${foundationCapacity}`,
      });

      res.json({
        message: "Configuração da Foundation atualizada com sucesso",
        systemConfig: updatedConfig,
        foundationConfig
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao reconfigurar Foundation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
