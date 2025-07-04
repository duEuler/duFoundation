// Foundation Setup Route - Auto-gerado (ES Modules)
import express from 'express';
const router = express.Router();

// Rota principal do Foundation Setup
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
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-shadow {
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="min-h-screen gradient-bg">
    <div id="foundation-root"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function FoundationSetup() {
            const [step, setStep] = useState(1);
            const [loading, setLoading] = useState(false);
            const [formData, setFormData] = useState({
                organizationName: '',
                capacity: 'nano',
                maxUsers: 100
            });
            
            const handleInstall = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/setup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    
                    if (response.ok) {
                        alert('Foundation instalado com sucesso!');
                        window.location.href = '/';
                    } else {
                        alert('Erro na instalação. Tente novamente.');
                    }
                } catch (error) {
                    alert('Erro de conexão. Verifique sua rede.');
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
                                Sistema de Gerenciamento Empresarial
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
                                    Máximo de Usuários Simultâneos
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
                                {loading ? 'Instalando...' : 'Instalar Foundation'}
                            </button>
                            
                            <div className="text-center">
                                <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                                    ← Voltar ao início
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        const root = ReactDOM.createRoot(document.getElementById('foundation-root'));
        root.render(<FoundationSetup />);
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

export default router;
