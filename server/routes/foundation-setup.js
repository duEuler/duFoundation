// Foundation Minimal Bridge - Direct integration with isolated app
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Path to Foundation isolated app
const foundationAppPath = path.join(__dirname, '../../foundation/_app');

// Serve Foundation wizard (setup page)
router.get('/foundation/setup', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>duEuler Foundation v3.0 - Setup</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-shadow { box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="min-h-screen gradient-bg">
    <div id="foundation-root"></div>
    <script type="text/babel">
        const { useState } = React;
        
        function FoundationSetup() {
            const [loading, setLoading] = useState(false);
            const [formData, setFormData] = useState({
                organizationName: '',
                capacity: 'small',
                maxUsers: 10000
            });
            
            const handleInstall = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/setup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            wizard: true,
                            setupPassword: 'dueuler2024',
                            adminUsername: 'admin',
                            adminEmail: 'admin@foundation.com',
                            adminPassword: 'admin123',
                            environment: 'production'
                        })
                    });
                    
                    if (response.ok) {
                        alert('Foundation configurado com sucesso!');
                        window.location.href = '/foundation/dashboard';
                    } else {
                        const error = await response.json();
                        alert('Erro: ' + error.message);
                    }
                } catch (error) {
                    alert('Erro de conexão: ' + error.message);
                } finally {
                    setLoading(false);
                }
            };
            
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg card-shadow p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                duEuler Foundation v3.0
                            </h1>
                            <p className="text-gray-600">
                                Configuração Inicial do Sistema
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Organização
                                </label>
                                <input
                                    type="text"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o nome da sua organização"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacidade do Sistema
                                </label>
                                <select
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="nano">Nano (até 1K usuários)</option>
                                    <option value="micro">Micro (até 10K usuários)</option>
                                    <option value="small">Pequeno (até 50K usuários)</option>
                                    <option value="medium">Médio (até 200K usuários)</option>
                                    <option value="large">Grande (até 500K usuários)</option>
                                    <option value="enterprise">Empresarial (1M+ usuários)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usuários Simultâneos
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxUsers}
                                    onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="100"
                                    max="1000000"
                                />
                            </div>
                            
                            <button
                                onClick={handleInstall}
                                disabled={loading || !formData.organizationName}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Configurando...' : 'Configurar Foundation'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('foundation-root'));
        root.render(<FoundationSetup />);
    </script>
</body>
</html>`;
  res.send(html);
});

// Serve Foundation dashboard
router.get('/foundation/dashboard', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>duEuler Foundation v3.0 - Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-gray-50">
    <div id="dashboard-root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function FoundationDashboard() {
            const [config, setConfig] = useState(null);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                fetch('/api/foundation/status')
                    .then(res => res.json())
                    .then(data => {
                        setConfig(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Erro ao carregar configuração:', err);
                        setLoading(false);
                    });
            }, []);
            
            if (loading) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando dashboard...</p>
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="min-h-screen bg-gray-50">
                    <nav className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        duEuler Foundation v3.0
                                    </h1>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500">
                                        {config?.organizationName || 'Organização'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>
                    
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
                                    <p className="text-green-600 font-semibold">
                                        {config?.installed ? 'Ativo' : 'Não Configurado'}
                                    </p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Capacidade</h3>
                                    <p className="text-blue-600 font-semibold">
                                        {config?.capacity ? config.capacity.toUpperCase() : 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ambiente</h3>
                                    <p className="text-purple-600 font-semibold">
                                        {config?.environment || 'Production'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Sistema Foundation Operacional
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-gray-700">
                                                    Sistema de Padronização Progressiva ativo
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-gray-700">
                                                    Verificação Preventiva funcionando
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-gray-700">
                                                    Templates Dinâmicos disponíveis
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <a href="/foundation/setup" 
                                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                                            Reconfigurar Sistema
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('dashboard-root'));
        root.render(<FoundationDashboard />);
    </script>
</body>
</html>`;
  res.send(html);
});

// Redirect /foundation to setup or dashboard based on configuration
router.get('/foundation', async (req, res) => {
  try {
    // Check if Foundation is configured
    const response = await fetch('http://localhost:5000/api/foundation/status');
    const status = await response.json();
    
    if (status.installed) {
      res.redirect('/foundation/dashboard');
    } else {
      res.redirect('/foundation/setup');
    }
  } catch (error) {
    // If status check fails, go to setup
    res.redirect('/foundation/setup');
  }
});

export default router;