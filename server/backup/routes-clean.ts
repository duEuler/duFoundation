/**
 * SISTEMA DE ROTAS CONSOLIDADO - Foundation v3.0
 * Arquivo: server/routes-clean.ts
 * 
 * DOCUMENTAÇÃO:
 * - Todas as APIs consolidadas em ordem correta
 * - Middleware aplicado antes das rotas específicas
 * - Foundation routes integradas nativamente
 * - Sem conflitos com Vite middleware
 * 
 * ORDEM DE EXECUÇÃO:
 * 1. Middleware de monitoramento
 * 2. APIs críticas (/api/login, /api/setup)
 * 3. Foundation routes (/foundation/*)
 * 4. APIs do sistema (/api/*)
 * 5. Vite middleware (aplicado em index.ts)
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { setupSchema, loginSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { monitoringService, createMonitoringMiddleware } from "./monitoring";
import { getFoundationConfig, validateCapacityForUsers, suggestCapacityForUsers, FOUNDATION_CONFIGS } from "./foundation-config";
import * as os from 'os';

export async function registerRoutes(app: Express): Promise<Server> {
  const SETUP_PASSWORD = "dueuler2024";
  
  // ========================================
  // 1. MIDDLEWARE GLOBAL - Aplicado primeiro
  // ========================================
  app.use(createMonitoringMiddleware(monitoringService));
  
  // ========================================
  // 2. APIs CRÍTICAS - Registradas ANTES de qualquer middleware que possa interceptar
  // ========================================
  
  // LOGIN API - Única API de login consolidada
  // Endpoint: POST /api/login
  // Body: { username: string, password: string }
  // Response: { success: boolean, message: string, user?: object }
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.json({ success: false, message: "Usuário e senha são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado" });
      }
      
      if (!user.isActive) {
        return res.json({ success: false, message: "Usuário inativo" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.json({ success: false, message: "Senha incorreta" });
      }
      
      // Atualizar último login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      res.json({ 
        success: true, 
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // ========================================
  // 3. FOUNDATION ROUTES - Registradas como middleware nativo
  // ========================================
  
  // Foundation Setup - Página HTML do wizard
  // Endpoint: GET /foundation/setup
  app.get('/foundation/setup', (req, res) => {
    const setupHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation v3.0 - Setup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 600px;
        }
        .success {
            text-align: center;
            color: #059669;
        }
        .btn {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            margin: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h1>🏛️ Foundation v3.0</h1>
            <p>Sistema instalado com sucesso!</p>
            <div style="margin-top: 30px;">
                <a href="/foundation/login" class="btn">Fazer Login</a>
                <a href="/" class="btn">Ir para Dashboard</a>
            </div>
        </div>
    </div>
</body>
</html>`;
    res.send(setupHtml);
  });

  // Foundation Root - Redireciona para login
  // Endpoint: GET /foundation/
  app.get('/foundation/', (req, res) => {
    res.redirect('/foundation/login');
  });

  // Foundation Login - Página de login
  // Endpoint: GET /foundation/login
  app.get('/foundation/login', (req, res) => {
    const loginHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #2563eb;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #374151;
            font-weight: 500;
            margin-bottom: 8px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
        }
        input:focus {
            outline: none;
            border-color: #2563eb;
        }
        .btn {
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
        }
        .btn:hover {
            background: #1d4ed8;
        }
        .message {
            margin-top: 15px;
            text-align: center;
            font-size: 14px;
        }
        .error { color: #dc2626; }
        .success { color: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🏛️ Foundation</h1>
            <p>Sistema de Gestão</p>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn">
                Entrar
            </button>
            
            <div id="message" class="message"></div>
        </form>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    messageDiv.innerHTML = '<div class="success">Login realizado! Redirecionando...</div>';
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    messageDiv.innerHTML = '<div class="error">' + (data.message || 'Usuário ou senha inválidos') + '</div>';
                }
            })
            .catch(error => {
                console.error('Erro no login:', error);
                messageDiv.innerHTML = '<div class="error">Erro de conexão. Tente novamente.</div>';
            });
        });
    </script>
</body>
</html>`;
    res.send(loginHtml);
  });

  // ========================================
  // 4. SETUP API - Sistema de configuração inicial
  // ========================================
  
  // Setup endpoint - Configuração inicial do sistema
  // Endpoint: POST /api/setup
  // Body: setupSchema (organization, admin user, etc)
  app.post("/api/setup", async (req, res) => {
    try {
      const data = setupSchema.parse(req.body);
      
      // Se não é wizard, valida senha de configuração
      if (!data.wizard && data.setupPassword !== SETUP_PASSWORD) {
        return res.status(401).json({ message: "Senha de configuração inválida" });
      }

      // Check if system is already set up
      const existingConfig = await storage.getSystemConfig();
      if (existingConfig && !data.wizard) {
        return res.status(409).json({ 
          message: "Sistema já configurado. Use o wizard para reconfiguração.",
          isConfigured: true 
        });
      }

      let config;
      if (existingConfig && data.wizard) {
        // Update existing config for wizard
        config = await storage.updateSystemConfig({
          organizationName: data.organizationName,
          environment: data.environment || "production",
          foundationCapacity: data.foundationCapacity || "small",
          maxUsers: data.maxUsers || 1000,
          features: JSON.stringify(data.features || []),
          updatedAt: new Date(),
        });
      } else {
        // Create new config
        config = await storage.createSystemConfig({
          organizationName: data.organizationName,
          environment: data.environment || "production", 
          foundationCapacity: data.foundationCapacity || "small",
          maxUsers: data.maxUsers || 1000,
          features: JSON.stringify(data.features || []),
        });
      }

      // Create admin user for wizard
      if (data.wizard && data.adminUsername && data.adminPassword) {
        const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
        
        try {
          await storage.createUser({
            username: data.adminUsername,
            password: hashedPassword,
            email: data.adminEmail || "",
            role: "admin",
            isActive: true,
          });
        } catch (error) {
          // User might already exist, that's ok for wizard
          console.log('Admin user already exists or error creating:', error.message);
        }
      }

      // Log the setup activity
      await storage.createActivityLog({
        userId: 1, // System user
        action: data.wizard ? "wizard_setup" : "initial_setup",
        description: `Sistema configurado: ${data.organizationName} - Capacidade: ${data.foundationCapacity}`,
      });

      res.json({ 
        message: "Sistema configurado com sucesso",
        config,
        wizard: data.wizard || false
      });

    } catch (error) {
      console.error("Setup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ========================================
  // 5. SYSTEM APIs - Status e informações do sistema
  // ========================================
  
  // System Status - Informações do sistema
  // Endpoint: GET /api/system/status
  app.get("/api/system/status", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      const users = await storage.getAllUsers();
      const metrics = await storage.getLatestMetrics();
      const activeSessions = await storage.getActiveSessionsCount();

      res.json({
        isConfigured: !!config,
        organization: config?.organizationName || null,
        environment: config?.environment || null,
        foundationCapacity: config?.foundationCapacity || null,
        stats: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          activeSessions: activeSessions,
          systemHealth: "operational"
        },
        foundationStatus: {
          installed: true,
          capacity: config?.foundationCapacity || null,
          organizationName: config?.organizationName || null,
          environment: config?.environment || null
        }
      });
    } catch (error) {
      console.error("Status error:", error);
      res.status(500).json({ message: "Erro ao obter status do sistema" });
    }
  });

  // ========================================
  // 6. HEALTH CHECK - Verificação básica
  // ========================================
  
  // Health endpoint - Verificação de saúde da API
  // Endpoint: GET /api/health
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "Foundation v3.0"
    });
  });

  // ========================================
  // 7. MONITORING - Métricas do sistema
  // ========================================
  
  // Metrics endpoint - Dados de monitoramento
  // Endpoint: GET /api/metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = monitoringService.getLatestMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Metrics error:", error);
      res.status(500).json({ message: "Erro ao obter métricas" });
    }
  });

  // ========================================
  // 8. CREATE HTTP SERVER
  // ========================================
  
  const httpServer = createServer(app);
  return httpServer;
}