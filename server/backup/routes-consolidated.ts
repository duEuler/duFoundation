/**
 * ====================================================================
 * SISTEMA DE ROTAS CONSOLIDADO FINAL - Foundation v3.0
 * ====================================================================
 * 
 * DOCUMENTAÇÃO TÉCNICA:
 * - Arquivo: server/routes-consolidated.ts
 * - Substitui: routes.ts, routes-clean.ts, routes/foundation-setup.js
 * - Integra: foundation/_app/server/routes.ts functionality
 * 
 * ARQUITETURA:
 * 1. Middleware registrado em ordem correta (ANTES do Vite)
 * 2. APIs críticas registradas primeiro (/api/login, /api/setup)
 * 3. Foundation routes nativas (sem router externo)
 * 4. Sistema de autenticação unificado
 * 5. Sem duplicações ou conflitos
 * 
 * ORDEM DE EXECUÇÃO GARANTIDA:
 * 1. Monitoring middleware
 * 2. Critical APIs
 * 3. Foundation HTML routes  
 * 4. System APIs
 * 5. Health/Status endpoints
 * 6. [Vite middleware - aplicado em index.ts DEPOIS]
 * 
 * PATHS PRINCIPAIS:
 * - POST /api/login - Autenticação unificada
 * - POST /api/setup - Configuração inicial/wizard
 * - GET /foundation/setup - Wizard HTML
 * - GET /foundation/login - Login HTML
 * - GET /foundation/ - Redirect para login
 * - GET /api/system/status - Status do sistema
 * - GET /api/health - Health check
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

// Session store for authentication
const activeSessions = new Map<string, any>();

// Middleware de autenticação
function authenticateUser(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = activeSessions.get(sessionId);
  
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  req.user = session.user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const SETUP_PASSWORD = "dueuler2024";
  
  // ========================================
  // 1. MIDDLEWARE GLOBAL - PRIMEIRA PRIORIDADE
  // ========================================
  
  // Monitoring middleware - aplicado a todas as rotas
  app.use(createMonitoringMiddleware(monitoringService));
  
  // CORS básico se necessário
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ========================================
  // 2. APIS CRÍTICAS - REGISTRADAS ANTES DO VITE
  // ========================================
  
  /**
   * LOGIN API - Autenticação única consolidada
   * Endpoint: POST /api/login
   * Body: { username: string, password: string }
   * Response: { success: boolean, message: string, user?: object, sessionId?: string }
   * 
   * USADO POR:
   * - Foundation login page (/foundation/login)
   * - Aplicação principal
   * - APIs que precisam de autenticação
   */
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.json({ success: false, message: "Usuário e senha são obrigatórios" });
      }
      
      // Buscar usuário no banco
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado" });
      }
      
      if (!user.isActive) {
        return res.json({ success: false, message: "Usuário inativo" });
      }
      
      // Verificar senha com bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.json({ success: false, message: "Senha incorreta" });
      }
      
      // Criar sessão
      const sessionId = uuidv4();
      const session = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      };
      
      activeSessions.set(sessionId, session);
      
      // Atualizar último login no banco
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Log da atividade
      await storage.createActivityLog({
        userId: user.id,
        action: "login",
        description: `Login realizado - ${username}`,
      });
      
      res.json({ 
        success: true, 
        message: "Login realizado com sucesso",
        user: session.user,
        sessionId: sessionId
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.json({ success: false, message: "Erro interno do servidor" });
    }
  });

  /**
   * LOGOUT API
   * Endpoint: POST /api/logout
   * Headers: Authorization: Bearer <sessionId>
   */
  app.post("/api/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
    res.json({ success: true, message: "Logout realizado com sucesso" });
  });

  /**
   * SETUP API - Configuração inicial do sistema e wizard
   * Endpoint: POST /api/setup
   * Body: setupSchema (ver shared/schema.ts)
   * 
   * FUNCIONALIDADES:
   * - Setup inicial com senha
   * - Wizard de 6 etapas
   * - Criação de usuário admin
   * - Configuração da Foundation
   */
  app.post("/api/setup", async (req, res) => {
    try {
      const data = setupSchema.parse(req.body);
      
      // Se não é wizard, valida senha de configuração
      if (!data.wizard && data.setupPassword !== SETUP_PASSWORD) {
        return res.status(401).json({ message: "Senha de configuração inválida" });
      }

      // Verificar se sistema já está configurado
      const existingConfig = await storage.getSystemConfig();
      if (existingConfig && !data.wizard) {
        return res.status(409).json({ 
          message: "Sistema já configurado. Use o wizard para reconfiguração.",
          isConfigured: true 
        });
      }

      let config;
      if (existingConfig && data.wizard) {
        // Atualizar configuração existente (wizard)
        config = await storage.updateSystemConfig({
          organizationName: data.organizationName,
          environment: data.environment || "production",
          foundationCapacity: data.foundationCapacity || "small",
          maxUsers: data.maxUsers || 1000,
          features: JSON.stringify(data.features || []),
          setupCompleted: true,
          updatedAt: new Date(),
        });
      } else {
        // Criar nova configuração
        config = await storage.createSystemConfig({
          organizationName: data.organizationName,
          environment: data.environment || "production", 
          foundationCapacity: data.foundationCapacity || "small",
          maxUsers: data.maxUsers || 1000,
          features: JSON.stringify(data.features || []),
          setupCompleted: true,
        });
      }

      // Criar usuário admin se é wizard
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
          // Usuário pode já existir, ok para wizard
          console.log('Admin user already exists or error creating:', error.message);
        }
      }

      // Log da atividade de setup
      await storage.createActivityLog({
        userId: 1, // Sistema
        action: data.wizard ? "wizard_setup" : "initial_setup",
        description: `Sistema configurado: ${data.organizationName} - Capacidade: ${data.foundationCapacity}`,
      });

      res.json({ 
        message: "Sistema configurado com sucesso",
        config,
        wizard: data.wizard || false,
        redirectTo: data.wizard ? "/foundation/" : "/"
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
  // 3. FOUNDATION HTML ROUTES - PÁGINAS NATIVAS
  // ========================================
  
  /**
   * Foundation Root - Redirect para login se não autenticado
   * Endpoint: GET /foundation/
   */
  app.get('/foundation/', (req, res) => {
    res.redirect('/foundation/login');
  });

  /**
   * Foundation Login Page - Página HTML standalone
   * Endpoint: GET /foundation/login
   */
  app.get('/foundation/login', (req, res) => {
    const loginHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation v3.0 - Login</title>
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
            margin-bottom: 15px;
        }
        .btn:hover {
            background: #1d4ed8;
        }
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .message {
            margin-top: 15px;
            text-align: center;
            font-size: 14px;
        }
        .error { color: #dc2626; }
        .success { color: #059669; }
        .info { color: #2563eb; }
        .loading { color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🏛️ Foundation</h1>
            <p>Sistema de Gestão v3.0</p>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" required placeholder="Digite seu usuário">
            </div>
            
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required placeholder="Digite sua senha">
            </div>
            
            <button type="submit" class="btn" id="loginBtn">
                Entrar
            </button>
            
            <div id="message" class="message"></div>
            
            <div class="info" style="text-align: center; margin-top: 20px; font-size: 12px;">
                <p>Credenciais padrão: admin / admin123</p>
            </div>
        </form>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            const loginBtn = document.getElementById('loginBtn');
            
            // Estado de loading
            loginBtn.disabled = true;
            loginBtn.textContent = 'Entrando...';
            messageDiv.innerHTML = '<div class="loading">Verificando credenciais...</div>';
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageDiv.innerHTML = '<div class="success">Login realizado! Redirecionando...</div>';
                    
                    // Armazenar sessão
                    if (data.sessionId) {
                        localStorage.setItem('foundation_session', data.sessionId);
                    }
                    
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    messageDiv.innerHTML = '<div class="error">' + (data.message || 'Usuário ou senha inválidos') + '</div>';
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Entrar';
                }
            } catch (error) {
                console.error('Erro no login:', error);
                messageDiv.innerHTML = '<div class="error">Erro de conexão. Tente novamente.</div>';
                loginBtn.disabled = false;
                loginBtn.textContent = 'Entrar';
            }
        });
        
        // Limpar mensagem ao digitar
        document.getElementById('username').addEventListener('input', () => {
            document.getElementById('message').innerHTML = '';
        });
        document.getElementById('password').addEventListener('input', () => {
            document.getElementById('message').innerHTML = '';
        });
    </script>
</body>
</html>`;
    res.send(loginHtml);
  });

  /**
   * Foundation Setup Page - Wizard HTML completo
   * Endpoint: GET /foundation/setup
   */
  app.get('/foundation/setup', async (req, res) => {
    // Verificar se já está configurado
    try {
      const systemConfig = await storage.getSystemConfig();
      if (systemConfig && systemConfig.setupCompleted) {
        // Se já configurado, mostrar página de sucesso
        const successHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation v3.0 - Configurado</title>
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
            max-width: 500px;
            text-align: center;
        }
        .success { color: #059669; margin-bottom: 30px; }
        .btn {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            margin: 10px;
            display: inline-block;
            font-weight: 500;
        }
        .btn:hover { background: #1d4ed8; }
        .info {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #0c4a6e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h1>🏛️ Foundation v3.0</h1>
            <h2>Sistema Configurado!</h2>
        </div>
        
        <div class="info">
            <p><strong>Organização:</strong> ${systemConfig.organizationName}</p>
            <p><strong>Ambiente:</strong> ${systemConfig.environment}</p>
            <p><strong>Capacidade:</strong> ${systemConfig.foundationCapacity}</p>
        </div>
        
        <div>
            <a href="/foundation/login" class="btn">Fazer Login</a>
            <a href="/" class="btn">Ir para Dashboard</a>
        </div>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Sistema instalado e funcionando corretamente
        </p>
    </div>
</body>
</html>`;
        return res.send(successHtml);
      }
    } catch (error) {
      // Se erro, continuar com wizard
    }

    // Mostrar wizard de setup se não configurado
    const wizardHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation v3.0 - Setup Wizard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #2563eb;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px;
        }
        .step {
            display: none;
        }
        .step.active {
            display: block;
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
        input, select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #2563eb;
        }
        .btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-right: 10px;
        }
        .btn:hover { background: #1d4ed8; }
        .btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .btn-secondary {
            background: #6b7280;
        }
        .btn-secondary:hover { background: #4b5563; }
        .progress {
            height: 4px;
            background: #e5e7eb;
            margin-bottom: 30px;
        }
        .progress-bar {
            height: 100%;
            background: #2563eb;
            transition: width 0.3s ease;
        }
        .message {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }
        .error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .success { background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }
        .info { background: #f0f9ff; color: #0c4a6e; border: 1px solid #bae6fd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Foundation v3.0</h1>
            <p>Wizard de Configuração</p>
        </div>
        
        <div class="progress">
            <div class="progress-bar" id="progressBar" style="width: 16.67%"></div>
        </div>
        
        <div class="content">
            <!-- Etapa 1: Configuração Administrativa -->
            <div class="step active" id="step1">
                <h2>Passo 1: Conta Administrativa</h2>
                <p style="margin-bottom: 20px; color: #6b7280;">Configure o usuário administrador do sistema</p>
                
                <div class="form-group">
                    <label for="adminUsername">Nome de Usuário do Admin</label>
                    <input type="text" id="adminUsername" required placeholder="admin">
                </div>
                
                <div class="form-group">
                    <label for="adminPassword">Senha do Admin</label>
                    <input type="password" id="adminPassword" required placeholder="Mínimo 6 caracteres">
                </div>
                
                <div class="form-group">
                    <label for="adminEmail">Email do Admin (opcional)</label>
                    <input type="email" id="adminEmail" placeholder="admin@empresa.com">
                </div>
                
                <button class="btn" onclick="nextStep(2)">Próximo</button>
                <div id="message1" class="message" style="display: none;"></div>
            </div>

            <!-- Etapa 2: Informações da Organização -->
            <div class="step" id="step2">
                <h2>Passo 2: Informações da Organização</h2>
                <p style="margin-bottom: 20px; color: #6b7280;">Configure os dados da sua organização</p>
                
                <div class="form-group">
                    <label for="organizationName">Nome da Organização</label>
                    <input type="text" id="organizationName" required placeholder="Minha Empresa">
                </div>
                
                <div class="form-group">
                    <label for="environment">Ambiente</label>
                    <select id="environment">
                        <option value="development">Desenvolvimento</option>
                        <option value="staging">Homologação</option>
                        <option value="production">Produção</option>
                    </select>
                </div>
                
                <button class="btn btn-secondary" onclick="prevStep(1)">Anterior</button>
                <button class="btn" onclick="nextStep(3)">Próximo</button>
                <div id="message2" class="message" style="display: none;"></div>
            </div>

            <!-- Etapa 3: Capacidade do Sistema -->
            <div class="step" id="step3">
                <h2>Passo 3: Capacidade do Sistema</h2>
                <p style="margin-bottom: 20px; color: #6b7280;">Selecione a capacidade adequada para seu uso</p>
                
                <div class="form-group">
                    <label for="foundationCapacity">Capacidade Foundation</label>
                    <select id="foundationCapacity">
                        <option value="nano">Nano (1-100 usuários)</option>
                        <option value="micro">Micro (100-1K usuários)</option>
                        <option value="small" selected>Small (1K-10K usuários)</option>
                        <option value="medium">Medium (10K-100K usuários)</option>
                        <option value="large">Large (100K-500K usuários)</option>
                        <option value="enterprise">Enterprise (500K+ usuários)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="maxUsers">Número Máximo de Usuários</label>
                    <input type="number" id="maxUsers" value="1000" min="1">
                </div>
                
                <button class="btn btn-secondary" onclick="prevStep(2)">Anterior</button>
                <button class="btn" onclick="nextStep(4)">Próximo</button>
                <div id="message3" class="message" style="display: none;"></div>
            </div>

            <!-- Etapa 4: Funcionalidades -->
            <div class="step" id="step4">
                <h2>Passo 4: Funcionalidades</h2>
                <p style="margin-bottom: 20px; color: #6b7280;">Selecione as funcionalidades que deseja ativar</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <input type="checkbox" checked style="margin-right: 10px; width: auto;">
                        Monitoramento Avançado
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <input type="checkbox" checked style="margin-right: 10px; width: auto;">
                        Logs de Atividade
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <input type="checkbox" style="margin-right: 10px; width: auto;">
                        Backup Automático
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <input type="checkbox" style="margin-right: 10px; width: auto;">
                        Notificações Email
                    </label>
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-secondary" onclick="prevStep(3)">Anterior</button>
                    <button class="btn" onclick="nextStep(5)">Próximo</button>
                </div>
                <div id="message4" class="message" style="display: none;"></div>
            </div>

            <!-- Etapa 5: Revisão -->
            <div class="step" id="step5">
                <h2>Passo 5: Revisão da Configuração</h2>
                <p style="margin-bottom: 20px; color: #6b7280;">Verifique as configurações antes de instalar</p>
                
                <div id="reviewContent" style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <!-- Conteúdo preenchido via JavaScript -->
                </div>
                
                <button class="btn btn-secondary" onclick="prevStep(4)">Anterior</button>
                <button class="btn" onclick="installFoundation()">Instalar Foundation</button>
                <div id="message5" class="message" style="display: none;"></div>
            </div>

            <!-- Etapa 6: Conclusão -->
            <div class="step" id="step6">
                <h2>🎉 Instalação Concluída!</h2>
                <p style="margin-bottom: 30px; color: #6b7280;">Foundation v3.0 foi configurado com sucesso</p>
                
                <div class="info" style="margin-bottom: 30px;">
                    <p><strong>Suas credenciais de login:</strong></p>
                    <p>Usuário: <span id="finalUsername"></span></p>
                    <p>Senha: [a senha que você definiu]</p>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <a href="/foundation/login" class="btn">Fazer Login</a>
                    <a href="/" class="btn btn-secondary">Ir para Dashboard</a>
                </div>
                <div id="message6" class="message" style="display: none;"></div>
            </div>
        </div>
    </div>

    <script>
        let currentStep = 1;
        const totalSteps = 6;

        function updateProgress() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        function showStep(step) {
            // Esconder todas as etapas
            for (let i = 1; i <= totalSteps; i++) {
                document.getElementById('step' + i).classList.remove('active');
            }
            // Mostrar etapa atual
            document.getElementById('step' + step).classList.add('active');
            currentStep = step;
            updateProgress();
        }

        function nextStep(step) {
            if (validateCurrentStep()) {
                if (step === 5) {
                    updateReview();
                }
                showStep(step);
            }
        }

        function prevStep(step) {
            showStep(step);
        }

        function validateCurrentStep() {
            const messageDiv = document.getElementById('message' + currentStep);
            messageDiv.style.display = 'none';

            if (currentStep === 1) {
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;
                
                if (!username || username.length < 3) {
                    showMessage(1, 'Nome de usuário deve ter pelo menos 3 caracteres', 'error');
                    return false;
                }
                if (!password || password.length < 6) {
                    showMessage(1, 'Senha deve ter pelo menos 6 caracteres', 'error');
                    return false;
                }
            }

            if (currentStep === 2) {
                const orgName = document.getElementById('organizationName').value;
                if (!orgName || orgName.length < 2) {
                    showMessage(2, 'Nome da organização é obrigatório', 'error');
                    return false;
                }
            }

            return true;
        }

        function showMessage(step, message, type = 'info') {
            const messageDiv = document.getElementById('message' + step);
            messageDiv.className = 'message ' + type;
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
        }

        function updateReview() {
            const reviewContent = document.getElementById('reviewContent');
            const features = Array.from(document.querySelectorAll('#step4 input[type="checkbox"]:checked'))
                .map(cb => cb.parentElement.textContent.trim());

            reviewContent.innerHTML = \`
                <h3 style="margin-bottom: 15px;">Configurações:</h3>
                <p><strong>Admin:</strong> \${document.getElementById('adminUsername').value}</p>
                <p><strong>Organização:</strong> \${document.getElementById('organizationName').value}</p>
                <p><strong>Ambiente:</strong> \${document.getElementById('environment').value}</p>
                <p><strong>Capacidade:</strong> \${document.getElementById('foundationCapacity').value}</p>
                <p><strong>Máx. Usuários:</strong> \${document.getElementById('maxUsers').value}</p>
                <p><strong>Funcionalidades:</strong> \${features.join(', ')}</p>
            \`;
        }

        async function installFoundation() {
            const messageDiv = document.getElementById('message5');
            messageDiv.style.display = 'none';

            // Mostrar loading
            const installBtn = document.querySelector('#step5 .btn:last-child');
            const originalText = installBtn.textContent;
            installBtn.disabled = true;
            installBtn.textContent = 'Instalando...';

            try {
                // Coletar features selecionadas
                const features = Array.from(document.querySelectorAll('#step4 input[type="checkbox"]:checked'))
                    .map(cb => cb.parentElement.textContent.trim());

                const setupData = {
                    wizard: true,
                    adminUsername: document.getElementById('adminUsername').value,
                    adminPassword: document.getElementById('adminPassword').value,
                    adminEmail: document.getElementById('adminEmail').value,
                    organizationName: document.getElementById('organizationName').value,
                    environment: document.getElementById('environment').value,
                    foundationCapacity: document.getElementById('foundationCapacity').value,
                    maxUsers: parseInt(document.getElementById('maxUsers').value),
                    features: features
                };

                const response = await fetch('/api/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(setupData)
                });

                const result = await response.json();

                if (response.ok) {
                    document.getElementById('finalUsername').textContent = setupData.adminUsername;
                    showStep(6);
                } else {
                    showMessage(5, result.message || 'Erro na instalação', 'error');
                    installBtn.disabled = false;
                    installBtn.textContent = originalText;
                }
            } catch (error) {
                console.error('Erro na instalação:', error);
                showMessage(5, 'Erro de conexão durante a instalação', 'error');
                installBtn.disabled = false;
                installBtn.textContent = originalText;
            }
        }

        // Atualizar capacidade baseada em usuários
        document.getElementById('maxUsers').addEventListener('input', function() {
            const users = parseInt(this.value);
            const capacitySelect = document.getElementById('foundationCapacity');
            
            if (users <= 100) capacitySelect.value = 'nano';
            else if (users <= 1000) capacitySelect.value = 'micro';
            else if (users <= 10000) capacitySelect.value = 'small';
            else if (users <= 100000) capacitySelect.value = 'medium';
            else if (users <= 500000) capacitySelect.value = 'large';
            else capacitySelect.value = 'enterprise';
        });
    </script>
</body>
</html>`;
    res.send(wizardHtml);
  });

  // ========================================
  // 4. SYSTEM APIs - Informações e status
  // ========================================
  
  /**
   * System Status API - Status completo do sistema
   * Endpoint: GET /api/system/status
   */
  app.get("/api/system/status", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      const users = await storage.getAllUsers();
      const activeSessions = await storage.getActiveSessionsCount();

      res.json({
        isConfigured: !!config,
        setupCompleted: config?.setupCompleted || false,
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

  /**
   * User Info API - Informações do usuário autenticado
   * Endpoint: GET /api/auth/me
   * Headers: Authorization: Bearer <sessionId>
   */
  app.get("/api/auth/me", authenticateUser, async (req: any, res) => {
    res.json({ user: req.user });
  });

  // ========================================
  // 5. HEALTH & MONITORING
  // ========================================
  
  /**
   * Health Check API
   * Endpoint: GET /api/health
   */
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "Foundation v3.0",
      uptime: process.uptime()
    });
  });

  /**
   * Metrics API - Dados de monitoramento
   * Endpoint: GET /api/metrics
   */
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
  // 6. CREATE HTTP SERVER
  // ========================================
  
  const httpServer = createServer(app);
  return httpServer;
}