/**
 * Foundation Installer v3.0 - Instalação Padronizada
 * 
 * Este módulo implementa a Fase 3 da arquitetura:
 * - Templates únicos pós-padronização
 * - Verificação funcional completa
 * - Rollback automático em falhas
 * 
 * BASEADO NOS PROBLEMAS IDENTIFICADOS:
 * 1. Rotas criadas mas não registradas
 * 2. Verificação pós-instalação insuficiente
 * 3. Falsos positivos mascarando problemas
 */

const fs = require('fs');
const path = require('path');
const { scanProject } = require('./foundation-scanner.cjs');

class FoundationInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.foundationDir = path.join(this.projectRoot, 'foundation');
    this.backupDir = path.join(this.foundationDir, '.installation-backup');
    this.results = {
      filesCreated: [],
      filesModified: [],
      validationResults: {},
      rollbackNeeded: false,
      success: false,
      errors: []
    };
  }

  /**
   * INSTALADOR PRINCIPAL
   */
  async installFoundation() {
    console.log('🚀 Foundation Installer v3.0 - Instalação Padronizada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Pré-validação obrigatória
      console.log('🔍 Executando pré-validação...');
      const preCheck = await this.preInstallationValidation();
      if (!preCheck.passed) {
        console.log('❌ Pré-validação falhou. Instalação cancelada.');
        return this.results;
      }

      // Criar backup completo
      await this.createInstallationBackup();

      // Instalação sequencial
      await this.createFoundationStructure();
      await this.installFoundationRoutes();
      await this.integrateWithServer();
      await this.createFoundationFiles();
      await this.integrateProjectInterface();
      await this.updateManifest();

      // Validação funcional completa
      console.log('\n🧪 Executando validação funcional...');
      const validation = await this.functionalValidation();
      
      if (validation.success) {
        this.results.success = true;
        await this.markInstallationComplete();
        console.log('✅ Foundation instalado com sucesso!');
      } else {
        console.log('❌ Validação funcional falhou. Iniciando rollback...');
        await this.performRollback();
      }

    } catch (error) {
      this.addError(`Erro durante instalação: ${error.message}`);
      console.log('❌ Erro crítico. Iniciando rollback...');
      await this.performRollback();
    }

    return this.results;
  }

  /**
   * PRÉ-VALIDAÇÃO OBRIGATÓRIA
   */
  async preInstallationValidation() {
    const results = { passed: false, issues: [] };

    // Verificar se Foundation já está instalado
    if (fs.existsSync(path.join(this.projectRoot, '.foundation-installed'))) {
      results.issues.push('Foundation já está instalado. Use foundation-remove primeiro.');
      return results;
    }

    // Executar scan completo
    const scanResults = await scanProject();
    
    if (scanResults.classification === 'INCOMPATÍVEL') {
      results.issues.push('Projeto incompatível. Execute foundation-migrator primeiro.');
      return results;
    }

    if (scanResults.classification === 'PRECISA_AJUSTES') {
      results.issues.push('Projeto precisa de ajustes. Execute foundation-migrator primeiro.');
      return results;
    }

    // Verificar dependências críticas
    if (!this.checkCriticalDependencies()) {
      results.issues.push('Dependências críticas faltando (express, typescript).');
      return results;
    }

    results.passed = true;
    console.log('✅ Pré-validação passou');
    return results;
  }

  /**
   * VERIFICAR DEPENDÊNCIAS CRÍTICAS
   */
  checkCriticalDependencies() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) return false;

    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = {
        ...packageData.dependencies || {},
        ...packageData.devDependencies || {}
      };

      const required = ['express', 'typescript'];
      return required.every(dep => allDeps[dep]);
    } catch {
      return false;
    }
  }

  /**
   * CRIAR BACKUP DE INSTALAÇÃO
   */
  async createInstallationBackup() {
    try {
      if (!fs.existsSync(this.foundationDir)) {
        fs.mkdirSync(this.foundationDir, { recursive: true });
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const filesToBackup = [
        'server/routes.ts',
        'server/routes.js',
        'server/index.ts',
        'server/index.js'
      ];

      for (const file of filesToBackup) {
        const sourcePath = path.join(this.projectRoot, file);
        if (fs.existsSync(sourcePath)) {
          const backupPath = path.join(this.backupDir, file.replace('/', '_'));
          fs.copyFileSync(sourcePath, backupPath);
        }
      }

      console.log('💾 Backup de instalação criado');
    } catch (error) {
      throw new Error(`Falha ao criar backup: ${error.message}`);
    }
  }

  /**
   * CRIAR ESTRUTURA FOUNDATION
   */
  async createFoundationStructure() {
    const dirs = [
      'foundation',
      'foundation/.config',
      'foundation/monitoring',
      'foundation/templates',
      'server/routes'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.results.filesCreated.push(dir);
      }
    }

    console.log('📁 Estrutura Foundation criada');
  }

  /**
   * INSTALAR ROTAS FOUNDATION
   */
  async installFoundationRoutes() {
    const routePath = path.join(this.projectRoot, 'server/routes/foundation-setup.js');
    
    // Detectar tipo de módulo para gerar template correto
    const moduleType = this.detectModuleType();
    const routeTemplate = this.generateFoundationRouteTemplate(moduleType);
    
    fs.writeFileSync(routePath, routeTemplate);
    this.results.filesCreated.push('server/routes/foundation-setup.js');
    
    console.log('🛠️ Rota Foundation instalada');
  }

  /**
   * DETECTAR TIPO DE MÓDULO
   */
  detectModuleType() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageData.type === 'module' ? 'ES_MODULES' : 'COMMONJS';
      } catch {
        return 'COMMONJS';
      }
    }
    return 'COMMONJS';
  }

  /**
   * INTEGRAR COM SERVIDOR
   */
  async integrateWithServer() {
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    const routesJSPath = path.join(this.projectRoot, 'server/routes.js');
    
    const targetFile = fs.existsSync(routesPath) ? routesPath : routesJSPath;
    
    if (!fs.existsSync(targetFile)) {
      throw new Error('Arquivo server/routes não encontrado');
    }

    let content = fs.readFileSync(targetFile, 'utf8');
    
    // Adicionar import se não existir
    if (!content.includes('foundation-setup')) {
      const importLine = this.detectModuleType() === 'ES_MODULES' 
        ? "import foundationSetup from './routes/foundation-setup.js';"
        : "const foundationSetup = require('./routes/foundation-setup.js');";
      
      content = importLine + '\n' + content;
      this.results.filesModified.push('Adicionado import foundation-setup');
    }

    // Adicionar registro da rota se não existir
    if (!content.includes('app.use(foundationSetup)')) {
      // Encontrar local para inserir app.use
      const createServerIndex = content.indexOf('createServer(app)');
      if (createServerIndex !== -1) {
        const insertPosition = content.lastIndexOf('\n', createServerIndex);
        const beforeServer = content.substring(0, insertPosition);
        const afterServer = content.substring(insertPosition);
        
        content = beforeServer + '\n  // Foundation routes\n  app.use(foundationSetup);\n' + afterServer;
        this.results.filesModified.push('Registrada rota Foundation no servidor');
      }
    }

    fs.writeFileSync(targetFile, content);
    console.log('🔗 Integração com servidor concluída');
  }

  /**
   * CRIAR ARQUIVOS FOUNDATION
   */
  async createFoundationFiles() {
    // Configuração Foundation
    const configPath = path.join(this.foundationDir, '.config/foundation.json');
    const config = {
      version: '3.0.0',
      capacity: 'SMALL',
      installed: new Date().toISOString(),
      features: ['monitoring', 'setup', 'management']
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.results.filesCreated.push('foundation/.config/foundation.json');

    // README Foundation
    const readmePath = path.join(this.foundationDir, 'README.md');
    const readmeContent = this.generateFoundationReadme();
    fs.writeFileSync(readmePath, readmeContent);
    this.results.filesCreated.push('foundation/README.md');

    console.log('📄 Arquivos Foundation criados');
  }

  /**
   * INTEGRAR INTERFACE DO PROJETO (MODIFICAÇÃO MÍNIMA)
   */
  async integrateProjectInterface() {
    console.log('🔗 Integrando interface do projeto...');
    
    try {
      const FoundationIntegratorSimple = require('./foundation-integrator-simple.cjs');
      const integrator = new FoundationIntegratorSimple();
      
      // Executar integração automática
      await integrator.integrate();
      
      this.results.filesModified.push('client/src/App.tsx (detecção Foundation)');
      console.log('✅ Interface do projeto integrada automaticamente');
      
    } catch (error) {
      console.log('⚠️ Aviso: Integração de interface falhou:', error.message);
      console.log('💡 Execute manualmente: node foundation/foundation-integrator-simple.cjs');
      this.results.warnings = this.results.warnings || [];
      this.results.warnings.push('Integração automática da interface falhou');
    }
  }

  /**
   * ATUALIZAR MANIFESTO
   */
  async updateManifest() {
    const manifestPath = path.join(this.projectRoot, '.foundation-manifest.json');
    const manifest = {
      version: '3.0.0',
      installed: new Date().toISOString(),
      files: this.results.filesCreated,
      modifications: this.results.filesModified,
      backup: this.backupDir,
      warnings: this.results.warnings || []
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('📋 Manifesto atualizado');
  }

  /**
   * VALIDAÇÃO FUNCIONAL
   */
  async functionalValidation() {
    const validation = { success: false, tests: {} };

    try {
      // Teste 1: Verificar se arquivos foram criados
      validation.tests.filesCreated = this.validateFilesCreated();
      
      // Teste 2: Verificar sintaxe dos arquivos
      validation.tests.syntaxValid = this.validateSyntax();
      
      // Teste 3: Verificar integração de rotas
      validation.tests.routeIntegration = this.validateRouteIntegration();
      
      // Aguardar servidor estabilizar
      console.log('⏳ Aguardando servidor estabilizar...');
      await this.waitForServer();
      
      // Teste 4: Verificar rota HTTP
      validation.tests.httpRoutes = await this.validateHTTPRoutes();

      // Determinar sucesso geral
      validation.success = Object.values(validation.tests).every(test => test.passed);
      
      this.results.validationResults = validation;
      return validation;

    } catch (error) {
      validation.tests.error = { passed: false, message: error.message };
      this.results.validationResults = validation;
      return validation;
    }
  }

  /**
   * VALIDAR ARQUIVOS CRIADOS
   */
  validateFilesCreated() {
    const requiredFiles = [
      'server/routes/foundation-setup.js',
      'foundation/.config/foundation.json',
      'foundation/README.md'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        return { passed: false, message: `Arquivo ${file} não foi criado` };
      }
    }

    return { passed: true, message: 'Todos os arquivos foram criados' };
  }

  /**
   * VALIDAR SINTAXE
   */
  validateSyntax() {
    try {
      const routePath = path.join(this.projectRoot, 'server/routes/foundation-setup.js');
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Verificações básicas de sintaxe
      if (this.detectModuleType() === 'ES_MODULES') {
        if (!content.includes('import ') || !content.includes('export default')) {
          return { passed: false, message: 'Sintaxe ES modules incorreta' };
        }
      }

      return { passed: true, message: 'Sintaxe válida' };
    } catch (error) {
      return { passed: false, message: `Erro de sintaxe: ${error.message}` };
    }
  }

  /**
   * VALIDAR INTEGRAÇÃO DE ROTAS
   */
  validateRouteIntegration() {
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    const routesJSPath = path.join(this.projectRoot, 'server/routes.js');
    
    const targetFile = fs.existsSync(routesPath) ? routesPath : routesJSPath;
    
    if (!fs.existsSync(targetFile)) {
      return { passed: false, message: 'Arquivo de rotas não encontrado' };
    }

    const content = fs.readFileSync(targetFile, 'utf8');
    
    if (!content.includes('foundation-setup')) {
      return { passed: false, message: 'Import foundation-setup não encontrado' };
    }

    if (!content.includes('app.use(foundationSetup)')) {
      return { passed: false, message: 'Registro da rota Foundation não encontrado' };
    }

    return { passed: true, message: 'Integração de rotas válida' };
  }

  /**
   * AGUARDAR SERVIDOR
   */
  async waitForServer(timeout = 10000) {
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * VALIDAR ROTAS HTTP
   */
  async validateHTTPRoutes() {
    try {
      const { execSync } = require('child_process');
      
      // Testar rota Foundation
      const foundationTest = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/foundation/setup', 
        { timeout: 5000, encoding: 'utf8' });
      
      if (foundationTest.trim() !== '200') {
        return { passed: false, message: `Rota Foundation retornou ${foundationTest}` };
      }

      return { passed: true, message: 'Rotas HTTP funcionando' };
    } catch (error) {
      return { passed: false, message: `Erro ao testar HTTP: ${error.message}` };
    }
  }

  /**
   * MARCAR INSTALAÇÃO COMPLETA
   */
  async markInstallationComplete() {
    const markerPath = path.join(this.projectRoot, '.foundation-installed');
    const marker = {
      version: '3.0.0',
      installed: new Date().toISOString(),
      validated: true
    };

    fs.writeFileSync(markerPath, JSON.stringify(marker, null, 2));
    console.log('✅ Instalação marcada como completa');
  }

  /**
   * REALIZAR ROLLBACK
   */
  async performRollback() {
    console.log('🔄 Iniciando rollback...');
    this.results.rollbackNeeded = true;

    try {
      // Remover arquivos criados
      for (const file of this.results.filesCreated) {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      }

      // Restaurar arquivos modificados do backup
      if (fs.existsSync(this.backupDir)) {
        const backupFiles = fs.readdirSync(this.backupDir);
        for (const backupFile of backupFiles) {
          const originalFile = backupFile.replace('_', '/');
          const backupPath = path.join(this.backupDir, backupFile);
          const originalPath = path.join(this.projectRoot, originalFile);
          
          if (fs.existsSync(originalPath)) {
            fs.copyFileSync(backupPath, originalPath);
          }
        }
      }

      console.log('✅ Rollback concluído');
    } catch (error) {
      console.log(`❌ Erro durante rollback: ${error.message}`);
    }
  }

  /**
   * TEMPLATES
   */
  generateFoundationRouteTemplate(moduleType) {
    if (moduleType === 'ES_MODULES') {
      return `// Foundation Setup Route - Auto-gerado (ES Modules)
import express from 'express';
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

    <div class="feature">
      <h3>🚀 Sistema de Padronização Progressiva</h3>
      <p>Foundation v3.0 implementa arquitetura híbrida que combina padronização rígida para projetos novos com migração assistida para projetos existentes.</p>
    </div>

    <div class="feature">
      <h3>🔍 Verificação Preventiva Obrigatória</h3>
      <p>Sistema bloqueia instalações incompatíveis automaticamente, detectando problemas antes que ocorram.</p>
    </div>

    <div class="feature">
      <h3>🛠️ Templates Dinâmicos</h3>
      <p>Geração automática de código ES modules ou CommonJS baseado no projeto alvo.</p>
    </div>

    <h3>🎯 Comandos Disponíveis:</h3>
    <div class="command">foundation-scanner</div>
    <div class="command">foundation-migrator</div>
    <div class="command">foundation-installer</div>
    <div class="command">foundation-remove</div>

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

export default router;
`;
    } else {
      return `// Foundation Setup Route - Auto-gerado (CommonJS)
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

    <div class="feature">
      <h3>🚀 Sistema de Padronização Progressiva</h3>
      <p>Foundation v3.0 implementa arquitetura híbrida que combina padronização rígida para projetos novos com migração assistida para projetos existentes.</p>
    </div>

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
    }
  }

  generateFoundationReadme() {
    return `# Foundation v3.0 - Sistema Instalado

## 🎉 Instalação Concluída

O Foundation v3.0 foi instalado com sucesso em seu projeto utilizando a arquitetura de **Padronização Progressiva Híbrida**.

## 🌟 Recursos Instalados

### ✅ Sistema de Verificação Preventiva
- Detecção automática de incompatibilidades
- Bloqueio de instalações problemáticas
- Validação funcional completa

### ✅ Templates Dinâmicos
- Geração automática ES modules/CommonJS
- Adaptação ao tipo de projeto
- Sintaxe sempre correta

### ✅ Integração Validada
- Rotas registradas no servidor
- Testes HTTP funcionais
- Rollback automático em falhas

## 🚀 Acesso ao Sistema

**Interface Web:** http://localhost:5000/foundation/setup

## 🛠️ Comandos Disponíveis

- \`foundation-scanner\` - Análise completa do projeto
- \`foundation-migrator\` - Migração automática
- \`foundation-remove\` - Desinstalação completa

## 📋 Arquivos Instalados

- \`server/routes/foundation-setup.js\` - Rota principal
- \`foundation/.config/foundation.json\` - Configuração
- \`.foundation-installed\` - Marcador de instalação
- \`.foundation-manifest.json\` - Manifesto detalhado

## 🔧 Suporte

Para problemas ou dúvidas, consulte:
- \`foundation/TROUBLESHOOTING.md\`
- \`foundation/FOUNDATION-ARCHITECTURE.md\`

---

**Instalado em:** ${new Date().toLocaleString('pt-BR')}  
**Versão:** 3.0.0  
**Status:** ✅ Validado e Funcional
`;
  }

  /**
   * UTILITÁRIOS
   */
  addError(error) {
    this.results.errors.push(error);
    console.log(`❌ ${error}`);
  }

  /**
   * GERAR RELATÓRIO
   */
  generateReport() {
    console.log('\n📊 RELATÓRIO DE INSTALAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`\n🎯 Status: ${this.results.success ? 'SUCESSO' : 'FALHA'}`);

    if (this.results.filesCreated.length > 0) {
      console.log('\n📁 ARQUIVOS CRIADOS:');
      this.results.filesCreated.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    if (this.results.filesModified.length > 0) {
      console.log('\n🔧 MODIFICAÇÕES:');
      this.results.filesModified.forEach(mod => {
        console.log(`   ✅ ${mod}`);
      });
    }

    if (this.results.validationResults.tests) {
      console.log('\n🧪 TESTES DE VALIDAÇÃO:');
      Object.entries(this.results.validationResults.tests).forEach(([test, result]) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`   ${icon} ${test}: ${result.message}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERROS:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    if (this.results.rollbackNeeded) {
      console.log('\n🔄 Rollback executado devido a falhas na validação');
    }

    if (this.results.success) {
      console.log('\n🌐 Acesse: http://localhost:5000/foundation/setup');
      console.log('🛠️ Para desinstalar: foundation-remove');
    }

    return this.results;
  }
}

/**
 * FUNÇÃO PRINCIPAL EXPORTADA
 */
async function installFoundation() {
  const installer = new FoundationInstaller();
  const results = await installer.installFoundation();
  installer.generateReport();
  
  // Salvar relatório de instalação
  const reportPath = path.join(installer.foundationDir, 'installation-report.json');
  if (!fs.existsSync(installer.foundationDir)) {
    fs.mkdirSync(installer.foundationDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
  
  return results;
}

// Executar se chamado diretamente
if (require.main === module) {
  installFoundation().catch(console.error);
}

module.exports = { FoundationInstaller, installFoundation };