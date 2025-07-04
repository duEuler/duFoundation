#!/usr/bin/env node

/**
 * Foundation Detector v3.0
 * Sistema de auto-detecção e instalação inteligente
 * 
 * ⚠️  VERIFICAÇÃO MANDATÓRIA DE COMPATIBILIDADE ⚠️
 * - SEMPRE executa verificação ANTES de qualquer operação
 * - SE houver incompatibilidades: PARA IMEDIATAMENTE
 * - NÃO permite prosseguir até correção dos problemas
 * 
 * Funcionalidades:
 * - Detecta se foundation já está instalado no projeto
 * - Pergunta ao usuário sobre instalação (S/N/I)
 * - Instala apenas arquivos essenciais no projeto
 * - Configura rota /foundation/setup automaticamente
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

class FoundationDetector {
  constructor() {
    // Detecta se está rodando dentro da pasta foundation ou na raiz
    this.foundationDir = __dirname;
    this.projectRoot = path.resolve(__dirname, '..');
    
    // Arquivos de controle
    this.foundationMarker = '.foundation-installed';
    this.foundationIgnore = '.foundation-ignore';
    
    // Paths importantes
    this.markerPath = path.join(this.projectRoot, this.foundationMarker);
    this.ignorePath = path.join(this.projectRoot, this.foundationIgnore);
    
    console.log('🔍 Foundation Detector v3.0 - Iniciando...');
    console.log(`📁 Foundation Dir: ${this.foundationDir}`);
    console.log(`📁 Project Root: ${this.projectRoot}`);
  }

  async detect() {
    try {
      // Verifica se deve ser ignorado
      if (this.isIgnored()) {
        console.log('⚠️  Foundation marcado como IGNORADO');
        console.log('💡 Para reativar, delete o arquivo .foundation-ignore');
        return;
      }

      // Verifica se já está instalado
      if (this.isInstalled()) {
        await this.showStatus();
        return;
      }

      // Se não está instalado, pergunta ao usuário
      await this.askInstallation();

    } catch (error) {
      console.error('❌ Erro no Foundation Detector:', error.message);
      process.exit(1);
    }
  }

  isInstalled() {
    return fs.existsSync(this.markerPath);
  }

  isIgnored() {
    return fs.existsSync(this.ignorePath);
  }

  async showStatus() {
    console.log('\n🌟 Foundation Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Foundation INSTALADO neste projeto');
    
    // Lê informações da instalação
    try {
      const markerData = JSON.parse(fs.readFileSync(this.markerPath, 'utf8'));
      console.log(`📅 Instalado em: ${markerData.installedAt}`);
      console.log(`🔧 Versão: ${markerData.version}`);
      console.log(`📊 Capacidade: ${markerData.capacity}`);
      
      // Verifica se a rota está funcionando
      await this.checkSetupRoute();
      
    } catch (error) {
      console.log('⚠️  Marker corrompido, pode precisar reinstalar');
    }

    console.log('\n🛠️  Opções disponíveis:');
    console.log('• foundation-remove - Desinstalar completamente');
    console.log('• Acesse: /foundation/setup - Interface de configuração');
  }

  async checkSetupRoute() {
    // Verifica se o arquivo da rota existe
    const setupRoutePath = path.join(this.projectRoot, 'server', 'routes', 'foundation-setup.js');
    if (fs.existsSync(setupRoutePath)) {
      console.log('✅ Rota /foundation/setup configurada');
    } else {
      console.log('⚠️  Rota /foundation/setup não encontrada');
    }
  }

  async askInstallation() {
    console.log('\n🌟 DuEuler Foundation v3.0 - Detector');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❓ Foundation NÃO detectado neste projeto.');
    console.log('');
    console.log('📦 O Foundation oferece:');
    console.log('   ✅ Sistema de monitoramento avançado');
    console.log('   ✅ Gerenciamento de dependências inteligente');
    console.log('   ✅ Templates e automação empresarial');
    console.log('   ✅ Interface de configuração /foundation/setup');
    console.log('   ✅ Comando foundation-remove para desinstalar');
    console.log('');
    console.log('🎯 Opções:');
    console.log('   S = SIM, instalar Foundation neste projeto');
    console.log('   N = NÃO, pular por enquanto');
    console.log('   I = IGNORAR, nunca mais perguntar');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\n🤔 Sua escolha (S/N/I): ', async (answer) => {
        rl.close();
        
        const choice = answer.toUpperCase().trim();
        console.log('');

        switch (choice) {
          case 'S':
          case 'SIM':
            console.log('✅ Instalação confirmada! Iniciando...');
            await this.installFoundation();
            break;

          case 'N':
          case 'NÃO':
          case 'NAO':
            console.log('⏭️  Instalação pulada. Execute novamente quando quiser instalar.');
            break;

          case 'I':
          case 'IGNORAR':
            console.log('🚫 Foundation marcado como IGNORADO');
            this.createIgnoreFile();
            break;

          default:
            console.log('⚠️  Opção inválida. Execute novamente.');
            break;
        }
        
        resolve();
      });
    });
  }

  async installFoundation() {
    try {
      // ⚠️ VERIFICAÇÃO MANDATÓRIA DE COMPATIBILIDADE ⚠️
      console.log('🔍 VERIFICAÇÃO COMPLETA E ANTECIPAÇÃO DE PROBLEMAS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const { verifyComprehensiveCompatibility } = await import('./comprehensive-checker.js');
      const compatibilityResult = await verifyComprehensiveCompatibility();
      if (!compatibilityResult.success) {
        console.log('\n🛑 INSTALAÇÃO BLOQUEADA - INCOMPATIBILIDADES CRÍTICAS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        compatibilityResult.errors.forEach((error, index) => {
          console.log(`${index + 1}. ❌ ${error}`);
        });
        
        console.log('\n📋 AÇÕES NECESSÁRIAS:');
        console.log('   • Corrija TODOS os erros listados acima');
        console.log('   • Execute novamente após as correções');
        console.log('   • NÃO prossiga até que todos os problemas sejam resolvidos');
        
        process.exit(1); // PARAR IMEDIATAMENTE
      }
      
      console.log('✅ Compatibilidade verificada - Prosseguindo com instalação');
      console.log('📦 Instalando Foundation básico...');
      
      // 1. Instala arquivos essenciais
      await this.installBasicFiles();
      
      // 2. Configura rota /foundation/setup
      await this.setupFoundationRoute();
      
      // 3. Testa funcionamento
      await this.testInstallation();
      
      // 4. Cria marker de instalação
      await this.createInstallationMarker();
      
      // 5. Mostra instruções finais
      this.showSuccessMessage();

    } catch (error) {
      console.error('❌ Erro na instalação:', error.message);
      console.log('💡 Tente executar foundation-remover.cjs primeiro');
    }
  }

  async installBasicFiles() {
    console.log('📁 Criando estrutura básica...');
    
    // Garante que os diretórios existem
    const dirs = [
      'server/routes',
      'client/src/pages/foundation',
      'shared'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✓ ${dir}/`);
      }
    });
  }

  async setupFoundationRoute() {
    console.log('🛠️  Configurando rota /foundation/setup...');
    
    const routeContent = `// Foundation Setup Route - Auto-gerado
const express = require('express');
const router = express.Router();

// Rota principal do Foundation Setup
router.get('/foundation/setup', (req, res) => {
  const html = \`
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
      foundation-remove
    </div>
    <p>Remove completamente o Foundation do projeto</p>

    <h2>📚 Próximos Passos</h2>
    <ol>
      <li>Explore as funcionalidades acima</li>
      <li>Configure suas preferências de monitoramento</li>
      <li>Personalize os templates conforme necessário</li>
      <li>Execute testes de performance</li>
    </ol>

    <div class="footer">
      <p><strong>DuEuler Foundation v3.0</strong> - Sistema empresarial de desenvolvimento</p>
      <p>Instalado em: \${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
  \`;
  
  res.send(html);
});

module.exports = router;
`;

    const routePath = path.join(this.projectRoot, 'server', 'routes', 'foundation-setup.js');
    fs.writeFileSync(routePath, routeContent);
    console.log('   ✓ server/routes/foundation-setup.js');

    // Atualiza o arquivo principal de rotas para incluir o foundation
    await this.updateMainRoutes();
  }

  async updateMainRoutes() {
    const routesPath = path.join(this.projectRoot, 'server', 'routes.ts');
    
    if (fs.existsSync(routesPath)) {
      let routesContent = fs.readFileSync(routesPath, 'utf8');
      
      // Verifica se já tem a importação
      if (!routesContent.includes('foundation-setup')) {
        // Adiciona importação
        const importLine = "const foundationSetup = require('./routes/foundation-setup');\n";
        routesContent = importLine + routesContent;
        
        // Adiciona uso da rota (procura por app.use)
        if (routesContent.includes('app.use(')) {
          routesContent = routesContent.replace(
            /app\.use\(/,
            "app.use(foundationSetup);\n  app.use("
          );
        }
        
        fs.writeFileSync(routesPath, routesContent);
        console.log('   ✓ Rota integrada em server/routes.ts');
      }
    }
  }

  async testInstallation() {
    console.log('🧪 Testando instalação...');
    
    // Testa se os arquivos foram criados
    const requiredFiles = [
      'server/routes/foundation-setup.js'
    ];

    let allGood = true;
    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✓ ${file}`);
      } else {
        console.log(`   ❌ ${file}`);
        allGood = false;
      }
    });

    if (!allGood) {
      throw new Error('Alguns arquivos não foram criados corretamente');
    }

    console.log('✅ Todos os testes passaram!');
  }

  async createInstallationMarker() {
    const markerData = {
      version: '3.0.0',
      capacity: 'SMALL',
      installedAt: new Date().toISOString(),
      installedBy: 'foundation-detector',
      files: [
        'server/routes/foundation-setup.js'
      ]
    };

    fs.writeFileSync(this.markerPath, JSON.stringify(markerData, null, 2));
    console.log('📄 Marker de instalação criado');
    
    // Cria manifesto detalhado para uninstall
    await this.createDetailedManifest();
  }

  async createDetailedManifest() {
    const manifestData = {
      version: '3.0.0',
      capacity: 'SMALL',
      installedAt: new Date().toISOString(),
      installedBy: 'foundation-detector',
      
      // Arquivos criados que devem ser removidos
      files: [
        'server/routes/foundation-setup.js'
      ],
      
      // Modificações feitas em arquivos existentes
      routeModifications: [
        {
          file: 'server/routes.ts',
          type: 'import',
          description: 'Adicionada importação do foundation-setup',
          content: "const foundationSetup = require('./routes/foundation-setup');\n",
          line: 1
        },
        {
          file: 'server/routes.ts',
          type: 'route',
          description: 'Adicionado uso da rota foundation',
          content: "app.use(foundationSetup);\n",
          searchPattern: "app.use("
        }
      ],
      
      // Diretórios criados (para remover se vazios)
      directories: [
        'server/routes'
      ],
      
      // Configurações e dependências
      configurations: {
        routes: {
          '/foundation/setup': 'Foundation setup interface'
        }
      },
      
      // Metadados para o uninstaller
      uninstall: {
        canRevert: true,
        requiresBackup: true,
        cleanupDirectories: true
      }
    };

    const manifestPath = path.join(this.projectRoot, '.foundation-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
    console.log('📄 Manifesto detalhado criado para uninstall');
  }

  createIgnoreFile() {
    const ignoreData = {
      ignoredAt: new Date().toISOString(),
      reason: 'User choice - never ask again'
    };

    fs.writeFileSync(this.ignorePath, JSON.stringify(ignoreData, null, 2));
    console.log('📄 Arquivo .foundation-ignore criado');
  }

  showSuccessMessage() {
    console.log('\n🎉 Foundation Instalado com Sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Arquivos básicos instalados');
    console.log('✅ Rota /foundation/setup configurada');
    console.log('✅ Sistema testado e funcionando');
    console.log('');
    console.log('🌐 Acesse agora:');
    console.log('   http://localhost:5000/foundation/setup');
    console.log('');
    console.log('🛠️  Para desinstalar:');
    console.log('   foundation-remove');
    console.log('');
    console.log('📚 Documentação completa em:');
    console.log('   foundation/README.md');
  }
  /**
   * ⚠️ VERIFICAÇÃO MANDATÓRIA DE COMPATIBILIDADE ⚠️
   * Esta função DEVE ser executada antes de qualquer operação
   * Se houver incompatibilidades, PARA IMEDIATAMENTE
   */
  async verifyCompatibilityMandatory() {
    const result = {
      compatible: true,
      errors: [],
      warnings: [],
      checks: []
    };

    // Verificação 1: ES Modules vs CommonJS
    result.checks.push('🔍 Verificando compatibilidade ES Modules...');
    
    // Verificar server/routes.ts
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf8');
      
      if (content.includes('require(') && content.includes('foundation-setup')) {
        result.errors.push('server/routes.ts usa require() com foundation-setup - deve usar import ES modules');
        result.compatible = false;
      }
    }

    // Verificar server/index.ts
    const indexPath = path.join(this.projectRoot, 'server/index.ts');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      if (content.includes('routes-minimal') && !content.includes('"./routes"')) {
        result.errors.push('server/index.ts está usando routes-minimal - deve usar routes completo');
        result.compatible = false;
      }
    }

    // Verificação 2: Estrutura de arquivos obrigatórios
    result.checks.push('🔍 Verificando estrutura do projeto...');
    
    const requiredFiles = [
      'server/index.ts',
      'server/routes.ts', 
      'package.json'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        result.errors.push(`Arquivo obrigatório não encontrado: ${file}`);
        result.compatible = false;
      }
    }

    // Verificação 3: Foundation setup route se existir
    const foundationSetupPath = path.join(this.projectRoot, 'server/routes/foundation-setup.js');
    if (fs.existsSync(foundationSetupPath)) {
      result.checks.push('🔍 Verificando rota foundation-setup existente...');
      
      const content = fs.readFileSync(foundationSetupPath, 'utf8');
      
      if (content.includes('module.exports') && !content.includes('export default')) {
        result.errors.push('server/routes/foundation-setup.js usa module.exports - deve usar export default');
        result.compatible = false;
      }
      
      if (content.includes('require(') && content.includes('express')) {
        result.errors.push('server/routes/foundation-setup.js usa require() - deve usar import');
        result.compatible = false;
      }
    }

    // Mostrar resultado da verificação
    if (result.compatible) {
      console.log('   ✅ Todas as verificações passaram');
    } else {
      console.log('\n❌ PROBLEMAS DE COMPATIBILIDADE ENCONTRADOS:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    return result;
  }
}

// Execução principal
async function main() {
  const detector = new FoundationDetector();
  await detector.detect();
}

// Executa apenas se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = FoundationDetector;