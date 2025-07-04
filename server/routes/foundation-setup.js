// Foundation Setup Route - Auto-gerado
const express = require('express');
const router = express.Router();

// Rota principal do Foundation Setup
router.get('/foundation/setup', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundation Setup v3.0</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #2563eb; margin: 0 0 20px 0; }
    .status { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .feature { background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0; }
    .command { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; font-family: monospace; margin: 10px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌟 DuEuler Foundation v3.0</h1>
    
    <div class="status">
      ✅ Foundation instalado e funcionando perfeitamente!
    </div>

    <h2>🚀 Capacidades Ativadas</h2>
    
    <div class="feature">
      <strong>📊 Sistema de Monitoramento Avançado</strong><br>
      Métricas em tempo real, dashboards e alertas inteligentes
    </div>
    
    <div class="feature">
      <strong>📦 Gerenciamento de Dependências</strong><br>
      Instalação automática e otimização de pacotes
    </div>
    
    <div class="feature">
      <strong>🏗️ Templates Empresariais</strong><br>
      Estruturas pré-configuradas para diferentes cenários
    </div>
    
    <div class="feature">
      <strong>⚡ Automação Inteligente</strong><br>
      Scripts de deploy, backup e manutenção automática
    </div>

    <h2>🛠️ Comandos Disponíveis</h2>
    
    <div class="command">
      foundation-uninstall
    </div>
    <p>Desinstalação avançada com registro detalhado (Recomendado)</p>
    
    <div class="command">
      foundation-remove
    </div>
    <p>Remoção básica do Foundation (Compatibilidade)</p>

    <h2>📚 Próximos Passos</h2>
    <ol>
      <li>Explore as funcionalidades acima</li>
      <li>Configure suas preferências de monitoramento</li>
      <li>Personalize os templates conforme necessário</li>
      <li>Execute testes de performance</li>
    </ol>

    <div class="footer">
      <p><strong>DuEuler Foundation v3.0</strong> - Sistema empresarial de desenvolvimento</p>
      <p>Instalado em: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  res.send(html);
});

// Rota de Uninstall do Foundation
router.get('/foundation/uninstall', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundation Uninstall v3.0</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #dc2626; margin: 0 0 20px 0; }
    .warning { background: #fef2f2; color: #991b1b; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0; }
    .info { background: #eff6ff; color: #1e40af; padding: 15px; border-radius: 8px; border: 1px solid #93c5fd; margin: 20px 0; }
    .command { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; font-family: monospace; margin: 10px 0; cursor: pointer; }
    .command:hover { background: #334155; }
    .btn { background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
    .btn:hover { background: #b91c1c; }
    .btn-secondary { background: #6b7280; }
    .btn-secondary:hover { background: #4b5563; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    .step { background: #f8fafc; padding: 15px; border-left: 4px solid #ef4444; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗑️ Foundation Uninstall v3.0</h1>
    
    <div class="warning">
      <strong>⚠️ ATENÇÃO:</strong> Esta operação irá REMOVER COMPLETAMENTE o Foundation deste projeto.
      O projeto retornará ao estado virgem original.
    </div>

    <h2>📋 O que será removido:</h2>
    
    <div class="step">
      <strong>📁 Arquivos criados pelo Foundation</strong><br>
      • server/routes/foundation-setup.js<br>
      • .foundation-installed<br>
      • .foundation-manifest.json
    </div>
    
    <div class="step">
      <strong>🔄 Modificações em arquivos existentes</strong><br>
      • Importações do foundation em server/routes.ts<br>
      • Rotas adicionadas pelo foundation
    </div>
    
    <div class="step">
      <strong>🎯 Estado final</strong><br>
      • Projeto voltará ao estado virgem<br>
      • Pronto para novos testes de instalação
    </div>

    <div class="info">
      <strong>✅ Garantias de Segurança:</strong><br>
      • Backup completo será criado antes da remoção<br>
      • Operação pode ser revertida se necessário<br>
      • Apenas arquivos do Foundation serão removidos
    </div>

    <h2>🛠️ Métodos de Desinstalação</h2>
    
    <h3>Método 1: Comando Terminal (Recomendado)</h3>
    <div class="command" onclick="copyToClipboard('foundation-uninstall')">
      foundation-uninstall
    </div>
    
    <h3>Método 2: Script Direto</h3>
    <div class="command" onclick="copyToClipboard('node foundation/foundation-uninstaller.cjs')">
      node foundation/foundation-uninstaller.cjs
    </div>
    
    <h3>Método 3: Via API (Para Desenvolvedores)</h3>
    <div class="command" onclick="copyToClipboard('curl -X POST http://localhost:5000/api/foundation/uninstall')">
      curl -X POST http://localhost:5000/api/foundation/uninstall
    </div>

    <h2>🔄 Reinstalação</h2>
    <p>Após a desinstalação, você pode reinstalar executando:</p>
    <div class="command" onclick="copyToClipboard('node foundation/foundation-detector.cjs')">
      node foundation/foundation-detector.cjs
    </div>

    <div class="footer">
      <p><strong>Foundation Uninstaller v3.0</strong> - Sistema avançado de desinstalação</p>
      <p>Clique nos comandos para copiar para a área de transferência</p>
    </div>
  </div>

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        alert('Comando copiado: ' + text);
      }, function() {
        alert('Erro ao copiar. Comando: ' + text);
      });
    }
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

// API endpoint para uninstall via POST
router.post('/api/foundation/uninstall', async (req, res) => {
  try {
    const FoundationUninstaller = require('../../foundation/foundation-uninstaller.cjs');
    const uninstaller = new FoundationUninstaller();
    
    const result = await uninstaller.uninstallWeb();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Foundation desinstalado com sucesso',
        result: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.reason || 'Erro na desinstalação',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno durante desinstalação',
      error: error.message
    });
  }
});

module.exports = router;
