// Sistema de Validações e Verificações para Instalação do Foundation
// Baseado nos erros encontrados e corrigidos na sessão

import fs from 'fs';
import path from 'path';

export class FoundationInstallationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  // Validação 1: Verificar compatibilidade ES Modules
  validateESModuleCompatibility() {
    console.log('🔍 Verificando compatibilidade ES Modules...');
    
    // Verificar se package.json tem type: "module" ou se usa .mjs
    const packageJsonPath = './package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.type || packageJson.type !== 'module') {
        this.warnings.push('Projeto não está configurado como ES Module, mas servidor TypeScript suporta');
      }
    }

    // Verificar se arquivos Foundation usam syntax correta
    const foundationFiles = [
      './server/routes/foundation-setup.js',
      './foundation/foundation-detector.cjs',
      './foundation/foundation-uninstaller.cjs'
    ];

    foundationFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Erro encontrado: require() em ES modules
        if (file.endsWith('.js') && content.includes('require(') && !content.includes('import ')) {
          this.errors.push(`${file}: Usando require() em ES module - deve usar import`);
          this.fixes.push(`Converter ${file}: require() → import, module.exports → export default`);
        }
        
        // Erro encontrado: module.exports em ES modules
        if (file.endsWith('.js') && content.includes('module.exports') && !content.includes('export ')) {
          this.errors.push(`${file}: Usando module.exports em ES module - deve usar export`);
        }
      }
    });
  }

  // Validação 2: Verificar integração de rotas no servidor
  validateRouteIntegration() {
    console.log('🔍 Verificando integração de rotas...');
    
    const routesFile = './server/routes.ts';
    const indexFile = './server/index.ts';
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Erro encontrado: import sem usar o módulo
      if (content.includes('import foundationSetup') && !content.includes('app.use(foundationSetup)')) {
        this.errors.push('routes.ts: Foundation setup importado mas não aplicado ao app');
        this.fixes.push('Adicionar: app.use(foundationSetup) após o import');
      }
    }

    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      
      // Erro encontrado: usando routes-minimal em vez de routes completo
      if (content.includes('routes-minimal')) {
        this.errors.push('index.ts: Usando routes-minimal em vez de routes completo');
        this.fixes.push('Alterar import para: ./routes em vez de ./routes-minimal');
      }
    }
  }

  // Validação 3: Verificar estrutura de arquivos Foundation
  validateFoundationStructure() {
    console.log('🔍 Verificando estrutura Foundation...');
    
    const requiredFiles = [
      './foundation/foundation-detector.cjs',
      './foundation/foundation-uninstaller.cjs', 
      './foundation/foundation-remove',
      './foundation/foundation-uninstall',
      './foundation/FOUNDATION.md',
      './foundation/.config/foundation.json'
    ];

    const requiredDirectories = [
      './foundation',
      './foundation/.config',
      './foundation/monitoring'
    ];

    requiredDirectories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        this.errors.push(`Diretório obrigatório não encontrado: ${dir}`);
        this.fixes.push(`Criar diretório: mkdir -p ${dir}`);
      }
    });

    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.errors.push(`Arquivo obrigatório não encontrado: ${file}`);
        this.fixes.push(`Criar arquivo Foundation: ${file}`);
      }
    });
  }

  // Validação 4: Verificar permissões de executáveis
  validateExecutablePermissions() {
    console.log('🔍 Verificando permissões de executáveis...');
    
    const executables = [
      './foundation/foundation-remove',
      './foundation/foundation-uninstall'
    ];

    executables.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.accessSync(file, fs.constants.X_OK);
        } catch {
          this.warnings.push(`${file}: Sem permissão de execução`);
          this.fixes.push(`chmod +x ${file}`);
        }
      }
    });
  }

  // Validação 5: Verificar configuração do servidor
  validateServerConfiguration() {
    console.log('🔍 Verificando configuração do servidor...');
    
    // Verificar se Vite não está interceptando rotas Foundation
    const viteConfigPath = './vite.config.ts';
    if (fs.existsSync(viteConfigPath)) {
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      // Assegurar que rotas Foundation são registradas antes do Vite
      if (!content.includes('// Foundation routes handled before Vite')) {
        this.warnings.push('Vite pode interceptar rotas Foundation se não configurado corretamente');
        this.fixes.push('Registrar rotas Foundation antes de setupVite() no servidor');
      }
    }
  }

  // Aplicar correções automáticas
  async applyAutomaticFixes() {
    console.log('🔧 Aplicando correções automáticas...');
    
    // Fix 1: Converter routes/foundation-setup.js para ES modules
    const foundationSetupPath = './server/routes/foundation-setup.js';
    if (fs.existsSync(foundationSetupPath)) {
      let content = fs.readFileSync(foundationSetupPath, 'utf8');
      
      // Converter require para import
      content = content.replace(/const express = require\('express'\);/, "import express from 'express';");
      content = content.replace(/module\.exports = router;/, 'export default router;');
      
      fs.writeFileSync(foundationSetupPath, content);
      console.log('✅ Convertido foundation-setup.js para ES modules');
    }

    // Fix 2: Corrigir routes.ts para usar Foundation
    const routesPath = './server/routes.ts';
    if (fs.existsSync(routesPath)) {
      let content = fs.readFileSync(routesPath, 'utf8');
      
      // Adicionar import se não existir
      if (!content.includes('import foundationSetup')) {
        content = `import foundationSetup from './routes/foundation-setup.js';\n${content}`;
      }
      
      // Adicionar app.use se não existir
      if (content.includes('import foundationSetup') && !content.includes('app.use(foundationSetup)')) {
        content = content.replace(
          /export async function registerRoutes\(app: Express\): Promise<Server> \{/,
          `export async function registerRoutes(app: Express): Promise<Server> {
  // Apply foundation setup route
  app.use(foundationSetup);`
        );
      }
      
      fs.writeFileSync(routesPath, content);
      console.log('✅ Corrigido routes.ts para usar Foundation');
    }

    // Fix 3: Corrigir index.ts para usar routes completo
    const indexPath = './server/index.ts';
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      if (content.includes('routes-minimal')) {
        content = content.replace('./routes-minimal', './routes');
        fs.writeFileSync(indexPath, content);
        console.log('✅ Corrigido index.ts para usar routes completo');
      }
    }
  }

  // Executar todas as validações
  async runAllValidations() {
    console.log('🚀 Iniciando validações completas do Foundation...\n');
    
    this.validateESModuleCompatibility();
    this.validateRouteIntegration();
    this.validateFoundationStructure();
    this.validateExecutablePermissions();
    this.validateServerConfiguration();

    // Aplicar correções se houver erros
    if (this.errors.length > 0) {
      console.log('\n❌ Erros encontrados:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      
      console.log('\n🔧 Correções necessárias:');
      this.fixes.forEach(fix => console.log(`  - ${fix}`));
      
      await this.applyAutomaticFixes();
      
      console.log('\n🔄 Executando validações novamente após correções...');
      this.errors = [];
      this.warnings = [];
      this.fixes = [];
      
      // Validar novamente
      this.validateESModuleCompatibility();
      this.validateRouteIntegration();
      this.validateFoundationStructure();
    }

    // Resumo final
    console.log('\n📊 Resumo da Validação:');
    console.log(`✅ Erros corrigidos: ${this.fixes.length}`);
    console.log(`⚠️  Avisos: ${this.warnings.length}`);
    console.log(`❌ Erros restantes: ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Avisos:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return this.errors.length === 0;
  }
}

// Função para executar validação completa
export async function validateFoundationInstallation() {
  const validator = new FoundationInstallationValidator();
  return await validator.runAllValidations();
}