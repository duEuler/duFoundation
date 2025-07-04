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

  // Foundation Root - Redireciona para o dashboard React oficial do _app
  // Endpoint: GET /foundation/
  app.get('/foundation/', (req, res) => {
    res.redirect('/api/foundation/admin');
  });

  // Dashboard React oficial do foundation/_app
  // Endpoint: GET /api/foundation/admin
  app.get('/api/foundation/admin', (req, res) => {
    const dashboardHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foundation v3.0 - Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; }
        .sidebar { width: 280px; position: fixed; height: 100vh; background: white; border-right: 1px solid #e5e7eb; overflow-y: auto; }
        .main-content { margin-left: 280px; min-height: 100vh; }
        @media (max-width: 768px) {
            .sidebar { width: 100%; position: static; height: auto; }
            .main-content { margin-left: 0; }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const DashboardPage = () => {
            const [metrics, setMetrics] = React.useState({});
            const [users, setUsers] = React.useState([]);
            const [config, setConfig] = React.useState({});

            React.useEffect(() => {
                loadData();
            }, []);

            const loadData = async () => {
                try {
                    const sessionId = localStorage.getItem('foundation_session');
                    if (!sessionId) {
                        window.location.href = '/foundation/login';
                        return;
                    }

                    const headers = {
                        'Authorization': \`Bearer \${sessionId}\`,
                        'Content-Type': 'application/json'
                    };

                    // Carregar métricas
                    const metricsRes = await fetch('/api/metrics', { headers });
                    if (metricsRes.ok) {
                        const metricsData = await metricsRes.json();
                        setMetrics(metricsData);
                    }

                    // Carregar usuários
                    const usersRes = await fetch('/api/users', { headers });
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        setUsers(usersData);
                    }

                    // Carregar configuração
                    const configRes = await fetch('/api/config', { headers });
                    if (configRes.ok) {
                        const configData = await configRes.json();
                        setConfig(configData);
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                }
            };

            return (
                <div className="min-h-screen bg-gray-50">
                    <div className="sidebar">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white">🏛️</span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">DuEuler</h2>
                                    <p className="text-xs text-gray-500">Foundation v3.0</p>
                                </div>
                            </div>
                        </div>

                        <nav className="mt-6">
                            <div className="px-6 mb-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Administração
                                </h3>
                            </div>
                            <ul className="space-y-1 px-3">
                                <li>
                                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                        📊 Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                        👥 Usuários
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                        ⚙️ Configurações
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                        📈 Métricas
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                        📋 Logs
                                    </a>
                                </li>
                            </ul>
                        </nav>

                        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('foundation_session');
                                    window.location.href = '/foundation/login';
                                }}
                                className="w-full flex items-center justify-start text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg"
                            >
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                    
                    <div className="main-content">
                        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900">Foundation v3.0</h1>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">Bem-vindo, Admin</span>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('foundation_session');
                                            window.location.href = '/foundation/login';
                                        }}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </header>

                        <main className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🏛️ Status do Sistema</h3>
                                    <div className="text-2xl font-bold text-green-600">Online</div>
                                    <p className="text-sm text-gray-600">Foundation v3.0 funcionando</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Usuários</h3>
                                    <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                                    <p className="text-sm text-gray-600">Total de usuários</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Capacidade</h3>
                                    <div className="text-2xl font-bold text-purple-600">{config.foundationCapacity || 'N/A'}</div>
                                    <p className="text-sm text-gray-600">Configuração atual</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 CPU</h3>
                                    <div className="text-2xl font-bold text-orange-600">{metrics.cpu_usage?.toFixed(1) || '--'}%</div>
                                    <p className="text-sm text-gray-600">Uso do processador</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Ações Rápidas</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={loadData}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            🔄 Atualizar Dados
                                        </button>
                                        <button
                                            onClick={() => alert('Funcionalidade em desenvolvimento')}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            📤 Exportar Relatório
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informações do Sistema</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Organização:</strong> {config.organizationName || 'N/A'}</div>
                                        <div><strong>Ambiente:</strong> {config.environment || 'N/A'}</div>
                                        <div><strong>Usuários Máx.:</strong> {config.maxConcurrentUsers || 'N/A'}</div>
                                        <div><strong>Cache TTL:</strong> {config.cacheTTL || 'N/A'}s</div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            );
        };

        // Verificar autenticação
        const sessionId = localStorage.getItem('foundation_session');
        if (!sessionId) {
            window.location.href = '/foundation/login';
        } else {
            ReactDOM.render(<DashboardPage />, document.getElementById('root'));
        }
    </script>
</body>
</html>`;
    res.send(dashboardHtml);
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
                        window.location.href = '/api/foundation/admin';
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