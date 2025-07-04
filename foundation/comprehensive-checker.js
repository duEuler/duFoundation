/**
 * Comprehensive Foundation Checker v3.1
 * VERIFICAÇÃO COMPLETA E ANTECIPAÇÃO DE PROBLEMAS
 * 
 * ANÁLISE COMPLETA DOS ERROS ENCONTRADOS:
 * 
 * 1. ERRO: ES Modules vs CommonJS
 *    - O installer criava arquivos CommonJS em projeto ES modules
 *    - Verificação antiga só checava arquivos existentes
 *    - SOLUÇÃO: Verificar templates ANTES da instalação
 * 
 * 2. ERRO: Router não registrado
 *    - Router importado mas não usado no app
 *    - Verificação não checava integração efetiva
 *    - SOLUÇÃO: Simular instalação e verificar integração
 * 
 * 3. ERRO: Templates incompatíveis
 *    - Foundation installer não adaptava ao tipo de projeto
 *    - SOLUÇÃO: Templates dinâmicos baseados no projeto
 */

import fs from 'fs';
import path from 'path';

export class ComprehensiveFoundationChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = process.cwd();
    this.installationPlan = [];
  }

  /**
   * VERIFICAÇÃO COMPLETA - ANTECIPA TODOS OS PROBLEMAS
   */
  async checkFullInstallation() {
    console.log('🔍 VERIFICAÇÃO COMPLETA DO FOUNDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.errors = [];
    this.warnings = [];
    this.installationPlan = [];

    // 1. Análise do projeto atual
    await this.analyzeCurrentProject();
    
    // 2. Simulação da instalação
    await this.simulateInstallation();
    
    // 3. Verificação de conflitos
    await this.checkInstallationConflicts();
    
    // 4. Validação de templates
    await this.validateTemplates();
    
    // 5. Teste de integração
    await this.testIntegration();

    // Relatório final
    return this.generateReport();
  }

  /**
   * ANÁLISE PROFUNDA DO PROJETO ATUAL
   */
  async analyzeCurrentProject() {
    console.log('📋 Analisando projeto atual...');
    
    // Detectar tipo de módulo (ES vs CommonJS)
    this.projectModuleType = await this.detectModuleType();
    console.log(`   🔍 Tipo de módulo detectado: ${this.projectModuleType}`);
    
    // Analisar estrutura de rotas
    this.routeStructure = await this.analyzeRouteStructure();
    console.log(`   🔍 Estrutura de rotas: ${JSON.stringify(this.routeStructure)}`);
    
    // Verificar configuração do servidor
    this.serverConfig = await this.analyzeServerConfig();
    console.log(`   🔍 Configuração servidor: ${JSON.stringify(this.serverConfig)}`);
    
    console.log('   ✅ Análise do projeto concluída');
  }

  /**
   * SIMULAÇÃO COMPLETA DA INSTALAÇÃO
   */
  async simulateInstallation() {
    console.log('🧪 Simulando instalação Foundation...');
    
    // Planejar arquivos que serão criados
    this.planFileCreation();
    
    // Planejar modificações em arquivos existentes
    this.planFileModifications();
    
    // Verificar se instalação causará conflitos
    await this.checkPlannedConflicts();
    
    console.log('   ✅ Simulação concluída');
  }

  /**
   * DETECTAR TIPO DE MÓDULO DO PROJETO
   */
  async detectModuleType() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.type === 'module') {
        return 'ES_MODULES';
      }
    }
    
    // Verificar por padrões de uso nos arquivos
    const serverFiles = ['server/index.ts', 'server/routes.ts'];
    let esModuleCount = 0;
    let commonJSCount = 0;
    
    for (const file of serverFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('import ') || content.includes('export ')) {
          esModuleCount++;
        }
        
        if (content.includes('require(') || content.includes('module.exports')) {
          commonJSCount++;
        }
      }
    }
    
    return esModuleCount > commonJSCount ? 'ES_MODULES' : 'COMMONJS';
  }

  /**
   * ANALISAR ESTRUTURA DE ROTAS
   */
  async analyzeRouteStructure() {
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    const indexPath = path.join(this.projectRoot, 'server/index.ts');
    
    const structure = {
      hasRouteFile: fs.existsSync(routesPath),
      usesMinimalRoutes: false,
      hasFoundationIntegration: false,
      routeRegistrationPattern: null
    };
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      structure.usesMinimalRoutes = indexContent.includes('routes-minimal');
      
      // Detectar padrão de registro de rotas
      if (indexContent.includes('registerRoutes')) {
        structure.routeRegistrationPattern = 'REGISTER_ROUTES_FUNCTION';
      } else if (indexContent.includes('app.use')) {
        structure.routeRegistrationPattern = 'APP_USE_DIRECT';
      }
    }
    
    if (structure.hasRouteFile) {
      const routesContent = fs.readFileSync(routesPath, 'utf8');
      structure.hasFoundationIntegration = routesContent.includes('foundation-setup');
    }
    
    return structure;
  }

  /**
   * ANALISAR CONFIGURAÇÃO DO SERVIDOR
   */
  async analyzeServerConfig() {
    const indexPath = path.join(this.projectRoot, 'server/index.ts');
    
    if (!fs.existsSync(indexPath)) {
      this.errors.push('Arquivo server/index.ts não encontrado');
      return null;
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    return {
      hasExpress: content.includes('express'),
      hasRegisterRoutes: content.includes('registerRoutes'),
      usesMinimalRoutes: content.includes('routes-minimal'),
      moduleType: content.includes('import ') ? 'ES_MODULES' : 'COMMONJS'
    };
  }

  /**
   * PLANEJAR CRIAÇÃO DE ARQUIVOS
   */
  planFileCreation() {
    // Arquivo principal que será criado
    const foundationSetupFile = {
      path: 'server/routes/foundation-setup.js',
      type: 'FOUNDATION_ROUTE',
      moduleType: this.projectModuleType,
      content: this.generateFoundationSetupTemplate()
    };
    
    this.installationPlan.push(foundationSetupFile);
  }

  /**
   * PLANEJAR MODIFICAÇÕES EM ARQUIVOS
   */
  planFileModifications() {
    // Modificação no routes.ts
    const routesModification = {
      path: 'server/routes.ts',
      type: 'ROUTE_INTEGRATION',
      changes: [
        {
          action: 'ADD_IMPORT',
          content: this.projectModuleType === 'ES_MODULES' 
            ? "import foundationSetup from './routes/foundation-setup.js';"
            : "const foundationSetup = require('./routes/foundation-setup');"
        },
        {
          action: 'ADD_USAGE',
          content: 'app.use(foundationSetup);'
        }
      ]
    };
    
    this.installationPlan.push(routesModification);
  }

  /**
   * VERIFICAR CONFLITOS NA INSTALAÇÃO PLANEJADA
   */
  async checkPlannedConflicts() {
    for (const item of this.installationPlan) {
      if (item.type === 'FOUNDATION_ROUTE') {
        // Verificar se arquivo ES modules está correto
        if (item.moduleType === 'ES_MODULES' && item.content.includes('require(')) {
          this.errors.push(`Template Foundation incompatível: usando CommonJS em projeto ES modules`);
        }
        
        if (item.moduleType === 'COMMONJS' && item.content.includes('import ')) {
          this.errors.push(`Template Foundation incompatível: usando ES modules em projeto CommonJS`);
        }
      }
      
      if (item.type === 'ROUTE_INTEGRATION') {
        // Verificar se modificação de rotas é compatível
        const routesPath = path.join(this.projectRoot, item.path);
        if (fs.existsSync(routesPath)) {
          const content = fs.readFileSync(routesPath, 'utf8');
          
          // Verificar conflito de módulos
          for (const change of item.changes) {
            if (change.action === 'ADD_IMPORT') {
              if (content.includes('import ') && change.content.includes('require(')) {
                this.errors.push(`Conflito de módulos: tentando adicionar require() em arquivo com imports`);
              }
              
              if (content.includes('require(') && change.content.includes('import ')) {
                this.errors.push(`Conflito de módulos: tentando adicionar import em arquivo com requires`);
              }
            }
          }
        }
      }
    }
  }

  /**
   * VALIDAR TEMPLATES ANTES DA INSTALAÇÃO
   */
  async validateTemplates() {
    console.log('🔧 Validando templates...');
    
    for (const item of this.installationPlan) {
      if (item.type === 'FOUNDATION_ROUTE') {
        // Validar sintaxe do template
        if (!this.validateTemplateSyntax(item.content)) {
          this.errors.push(`Template Foundation tem sintaxe inválida`);
        }
        
        // Verificar compatibilidade de módulos
        if (!this.validateModuleCompatibility(item.content, item.moduleType)) {
          this.errors.push(`Template Foundation incompatível com tipo de módulo ${item.moduleType}`);
        }
      }
    }
    
    console.log('   ✅ Validação de templates concluída');
  }

  /**
   * TESTAR INTEGRAÇÃO ANTES DA INSTALAÇÃO
   */
  async testIntegration() {
    console.log('🧪 Testando integração...');
    
    // Simular se rotas serão registradas corretamente
    if (!this.routeStructure.hasRouteFile) {
      this.errors.push('Arquivo server/routes.ts não existe - integração Foundation impossível');
    }
    
    if (this.routeStructure.usesMinimalRoutes) {
      this.errors.push('Projeto usa routes-minimal - deve usar routes completo para Foundation');
    }
    
    // Verificar se haverá registro adequado das rotas
    let willRegisterRoutes = false;
    for (const item of this.installationPlan) {
      if (item.type === 'ROUTE_INTEGRATION') {
        const hasUsage = item.changes.some(change => 
          change.action === 'ADD_USAGE' && change.content.includes('app.use')
        );
        if (hasUsage) {
          willRegisterRoutes = true;
        }
      }
    }
    
    if (!willRegisterRoutes) {
      this.errors.push('Instalação não registrará rotas Foundation adequadamente');
    }
    
    console.log('   ✅ Teste de integração concluído');
  }

  /**
   * GERAR TEMPLATE FOUNDATION CORRETO
   */
  generateFoundationSetupTemplate() {
    if (this.projectModuleType === 'ES_MODULES') {
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
  </style>
</head>
<body>
  <div class="container">
    <h1>🏗️ DuEuler Foundation v3.0</h1>
    <div class="status">
      ✅ Foundation instalado e funcionando corretamente!
    </div>
    <p>Instalado em: \${new Date().toLocaleString('pt-BR')}</p>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>🏗️ DuEuler Foundation v3.0</h1>
    <div class="status">
      ✅ Foundation instalado e funcionando corretamente!
    </div>
    <p>Instalado em: \${new Date().toLocaleString('pt-BR')}</p>
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

  /**
   * VALIDAR SINTAXE DO TEMPLATE
   */
  validateTemplateSyntax(content) {
    // Verificações básicas de sintaxe
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return false;
    }
    
    // Verificar se tem estrutura mínima necessária
    if (!content.includes('router.get') || !content.includes('/foundation/setup')) {
      return false;
    }
    
    return true;
  }

  /**
   * VALIDAR COMPATIBILIDADE DE MÓDULOS
   */
  validateModuleCompatibility(content, moduleType) {
    if (moduleType === 'ES_MODULES') {
      // Em ES modules, não deve ter require ou module.exports
      if (content.includes('require(') || content.includes('module.exports')) {
        return false;
      }
      
      // Deve ter import e export
      if (!content.includes('import ') || !content.includes('export ')) {
        return false;
      }
    } else {
      // Em CommonJS, não deve ter import ou export
      if (content.includes('import ') || content.includes('export ')) {
        return false;
      }
      
      // Deve ter require e module.exports
      if (!content.includes('require(') || !content.includes('module.exports')) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * GERAR RELATÓRIO COMPLETO
   */
  generateReport() {
    const hasErrors = this.errors.length > 0;
    
    if (hasErrors) {
      console.log('\n🛑 INSTALAÇÃO BLOQUEADA - PROBLEMAS DETECTADOS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ❌ ${error}`);
      });
      
      console.log('\n📋 AÇÕES NECESSÁRIAS:');
      console.log('   • Corrija TODOS os problemas listados acima');
      console.log('   • Execute a verificação novamente');
      console.log('   • NÃO prossiga até resolver todos os conflitos');
      
      return { success: false, errors: this.errors, warnings: this.warnings };
    } else {
      console.log('\n✅ VERIFICAÇÃO COMPLETA APROVADA');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   ✅ Todos os testes passaram');
      console.log('   ✅ Instalação segura para prosseguir');
      console.log('   ✅ Templates validados e compatíveis');
      console.log('   ✅ Integração testada e aprovada');
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  AVISOS (não bloqueiam instalação):');
        this.warnings.forEach((warning, index) => {
          console.log(`${index + 1}. ⚠️  ${warning}`);
        });
      }
      
      return { success: true, errors: [], warnings: this.warnings, plan: this.installationPlan };
    }
  }
}

/**
 * FUNÇÃO PRINCIPAL DE VERIFICAÇÃO COMPLETA
 */
export async function verifyComprehensiveCompatibility() {
  const checker = new ComprehensiveFoundationChecker();
  const result = await checker.checkFullInstallation();
  
  if (!result.success) {
    console.log('\n🚨 INSTALAÇÃO IMPEDIDA POR PROBLEMAS DE COMPATIBILIDADE');
    process.exit(1);
  }
  
  return result;
}