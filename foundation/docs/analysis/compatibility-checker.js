/**
 * Foundation Compatibility Checker
 * VERIFICAÇÃO OBRIGATÓRIA - DEVE SER EXECUTADA ANTES DE QUALQUER OPERAÇÃO
 * 
 * Este módulo verifica todas as compatibilidades ANTES de iniciar instalação
 * - ES Modules vs CommonJS
 * - Estrutura de rotas
 * - Configuração do servidor
 * - Dependências necessárias
 * 
 * SE HOUVER QUALQUER INCOMPATIBILIDADE: PARAR IMEDIATAMENTE E AVISAR
 */

import fs from 'fs';
import path from 'path';

export class FoundationCompatibilityChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = process.cwd();
  }

  /**
   * VERIFICAÇÃO MANDATÓRIA - EXECUTAR ANTES DE QUALQUER OPERAÇÃO
   * Retorna false se houver QUALQUER incompatibilidade
   */
  async checkFullCompatibility() {
    console.log('🔍 VERIFICAÇÃO OBRIGATÓRIA DE COMPATIBILIDADE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.errors = [];
    this.warnings = [];

    // Verificações obrigatórias
    await this.checkESModuleCompatibility();
    await this.checkProjectStructure();
    await this.checkServerConfiguration();
    await this.checkRouteConfiguration();
    await this.checkDependencies();
    await this.checkExistingFoundation();

    // Se houver QUALQUER erro: PARAR IMEDIATAMENTE
    if (this.errors.length > 0) {
      console.log('\n❌ INCOMPATIBILIDADES CRÍTICAS DETECTADAS!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ❌ ${error}`);
      });

      console.log('\n🛑 OPERAÇÃO BLOQUEADA - CORRIJA OS ERROS ANTES DE CONTINUAR');
      console.log('📋 Ações necessárias:');
      console.log('   • Corrija todos os erros listados acima');
      console.log('   • Execute novamente a verificação');
      console.log('   • Só então prossiga com a instalação');
      
      return false;
    }

    // Mostrar warnings se houver
    if (this.warnings.length > 0) {
      console.log('\n⚠️  AVISOS DETECTADOS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ⚠️  ${warning}`);
      });
    }

    console.log('\n✅ COMPATIBILIDADE VERIFICADA - PROSSEGUIR SEGURO');
    return true;
  }

  async checkESModuleCompatibility() {
    console.log('🔍 Verificando compatibilidade ES Modules...');
    
    // Verificar package.json
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.type !== 'module') {
        this.warnings.push('package.json não tem "type": "module" - pode causar problemas de importação');
      }
    }

    // Verificar arquivos que podem ter CommonJS
    const filesToCheck = [
      'server/routes.ts',
      'server/index.ts',
      'server/routes/foundation-setup.js'
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('require(') && !content.includes('import ')) {
          this.errors.push(`${file} usa CommonJS (require) - deve usar ES modules (import)`);
        }
        
        if (content.includes('module.exports') && !content.includes('export ')) {
          this.errors.push(`${file} usa module.exports - deve usar export default ou export`);
        }
      }
    }
    
    console.log('   ✓ Verificação ES Modules concluída');
  }

  async checkProjectStructure() {
    console.log('🔍 Verificando estrutura do projeto...');
    
    const requiredDirs = ['server', 'client'];
    const requiredFiles = ['server/index.ts', 'package.json'];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(path.join(this.projectRoot, dir))) {
        this.errors.push(`Diretório obrigatório não encontrado: ${dir}`);
      }
    }

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        this.errors.push(`Arquivo obrigatório não encontrado: ${file}`);
      }
    }
    
    console.log('   ✓ Verificação estrutura concluída');
  }

  async checkServerConfiguration() {
    console.log('🔍 Verificando configuração do servidor...');
    
    const indexPath = path.join(this.projectRoot, 'server/index.ts');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Verificar se está usando routes-minimal em vez de routes
      if (content.includes('routes-minimal') && !content.includes('from "./routes"')) {
        this.errors.push('server/index.ts está usando routes-minimal - deve usar routes completo');
      }
      
      // Verificar se tem as importações necessárias
      if (!content.includes('registerRoutes')) {
        this.errors.push('server/index.ts não importa registerRoutes');
      }
    }
    
    console.log('   ✓ Verificação servidor concluída');
  }

  async checkRouteConfiguration() {
    console.log('🔍 Verificando configuração de rotas...');
    
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Verificar se tem foundation setup já integrado
      if (content.includes('foundation-setup') && content.includes('require(')) {
        this.errors.push('server/routes.ts tem integração Foundation com require() - deve usar import');
      }
    }
    
    console.log('   ✓ Verificação rotas concluída');
  }

  async checkDependencies() {
    console.log('🔍 Verificando dependências...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = ['express', 'tsx'];
      const missingDeps = requiredDeps.filter(dep => !deps[dep]);
      
      if (missingDeps.length > 0) {
        this.errors.push(`Dependências obrigatórias ausentes: ${missingDeps.join(', ')}`);
      }
    }
    
    console.log('   ✓ Verificação dependências concluída');
  }

  async checkExistingFoundation() {
    console.log('🔍 Verificando Foundation existente...');
    
    const foundationMarker = path.join(this.projectRoot, '.foundation-installed');
    const foundationDir = path.join(this.projectRoot, 'foundation');
    
    if (fs.existsSync(foundationMarker) || fs.existsSync(foundationDir)) {
      this.warnings.push('Foundation já instalado - operação pode sobrescrever configurações');
    }
    
    console.log('   ✓ Verificação Foundation concluída');
  }

  /**
   * Gera relatório detalhado de compatibilidade
   */
  generateReport() {
    const report = {
      compatible: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString(),
      recommendations: []
    };

    // Gerar recomendações baseadas nos erros
    this.errors.forEach(error => {
      if (error.includes('CommonJS')) {
        report.recommendations.push('Converter arquivos de CommonJS para ES modules');
      }
      if (error.includes('routes-minimal')) {
        report.recommendations.push('Atualizar server/index.ts para usar routes completo');
      }
      if (error.includes('foundation-setup') && error.includes('require')) {
        report.recommendations.push('Corrigir importação do foundation-setup para ES modules');
      }
    });

    return report;
  }
}

// Função principal para uso nos scripts
export async function verifyCompatibilityMandatory() {
  const checker = new FoundationCompatibilityChecker();
  const isCompatible = await checker.checkFullCompatibility();
  
  if (!isCompatible) {
    console.log('\n🛑 VERIFICAÇÃO MANDATÓRIA FALHOU');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ Operação bloqueada devido a incompatibilidades críticas');
    console.log('📋 Execute as correções necessárias antes de prosseguir');
    
    process.exit(1); // PARAR IMEDIATAMENTE
  }
  
  return checker.generateReport();
}