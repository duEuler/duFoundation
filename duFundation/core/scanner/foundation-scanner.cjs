/**
 * Foundation Scanner v3.0 - Análise Completa de Projetos
 * 
 * Este módulo implementa a Fase 1 da arquitetura:
 * - Scanner completo do projeto
 * - Classificação: "Compatível", "Precisa ajustes", "Incompatível"
 * - Relatório detalhado de requisitos
 * 
 * BASEADO NOS PROBLEMAS IDENTIFICADOS:
 * 1. Incompatibilidade ES Modules vs CommonJS
 * 2. Integração de rotas incompleta
 * 3. Verificação pós-instalação insuficiente
 */

const fs = require('fs');
const path = require('path');

class FoundationProjectScanner {
  constructor() {
    this.projectRoot = process.cwd();
    this.foundationDir = path.join(this.projectRoot, 'foundation');
    this.results = {
      classification: 'UNKNOWN',
      score: 0,
      maxScore: 100,
      issues: [],
      recommendations: [],
      requirements: [],
      analysis: {}
    };
  }

  /**
   * SCANNER PRINCIPAL - ANÁLISE COMPLETA
   */
  async scanProject() {
    console.log('🔍 Foundation Scanner v3.0 - Análise Completa');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await this.analyzePackageJson();
    await this.analyzeProjectStructure();
    await this.analyzeServerConfiguration();
    await this.analyzeModuleSystem();
    await this.analyzeRouteSystem();
    await this.analyzeTypeScriptConfig();
    await this.analyzeDependencies();
    await this.checkExistingFoundation();
    
    this.calculateScore();
    this.generateClassification();
    this.generateRecommendations();
    
    return this.results;
  }

  /**
   * ANÁLISE DO PACKAGE.JSON
   */
  async analyzePackageJson() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.addIssue('CRITICAL', 'package.json não encontrado', 'Projeto deve ter package.json válido');
      return;
    }

    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      this.results.analysis.packageJson = packageData;

      // Verificar tipo de módulo
      if (packageData.type === 'module') {
        this.addSuccess('ES Modules configurado corretamente');
        this.results.score += 15;
      } else if (!packageData.type || packageData.type === 'commonjs') {
        this.addIssue('MAJOR', 'Projeto usando CommonJS', 'Migração para ES Modules recomendada');
        this.addRequirement('Migrar para ES Modules (type: "module" no package.json)');
      }

      // Verificar scripts essenciais
      if (packageData.scripts && packageData.scripts.dev) {
        this.addSuccess('Script dev encontrado');
        this.results.score += 5;
      } else {
        this.addIssue('MINOR', 'Script dev não encontrado', 'Adicionar script de desenvolvimento');
      }

    } catch (error) {
      this.addIssue('CRITICAL', 'package.json inválido', 'Corrigir sintaxe do package.json');
    }
  }

  /**
   * ANÁLISE DA ESTRUTURA DO PROJETO
   */
  async analyzeProjectStructure() {
    const requiredDirs = ['server', 'client', 'shared'];
    const foundDirs = [];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        foundDirs.push(dir);
        this.results.score += 10;
      }
    }

    this.results.analysis.projectStructure = {
      requiredDirs,
      foundDirs,
      missingDirs: requiredDirs.filter(dir => !foundDirs.includes(dir))
    };

    if (foundDirs.length === requiredDirs.length) {
      this.addSuccess('Estrutura de projeto completa');
    } else {
      this.addIssue('MAJOR', `Estrutura incompleta: faltam ${this.results.analysis.projectStructure.missingDirs.join(', ')}`, 
        'Criar estrutura de pastas necessária');
    }
  }

  /**
   * ANÁLISE DA CONFIGURAÇÃO DO SERVIDOR
   */
  async analyzeServerConfiguration() {
    const serverFiles = [
      'server/index.ts',
      'server/index.js',
      'server/routes.ts',
      'server/routes.js'
    ];

    const foundFiles = serverFiles.filter(file => 
      fs.existsSync(path.join(this.projectRoot, file))
    );

    this.results.analysis.serverFiles = foundFiles;

    if (foundFiles.some(file => file.includes('index'))) {
      this.addSuccess('Arquivo principal do servidor encontrado');
      this.results.score += 15;
    } else {
      this.addIssue('CRITICAL', 'Arquivo principal do servidor não encontrado', 
        'Criar server/index.ts com configuração Express');
    }

    if (foundFiles.some(file => file.includes('routes'))) {
      this.addSuccess('Sistema de rotas encontrado');
      this.results.score += 10;
    } else {
      this.addIssue('MAJOR', 'Sistema de rotas não encontrado', 
        'Criar server/routes.ts para organização das rotas');
    }
  }

  /**
   * ANÁLISE DO SISTEMA DE MÓDULOS
   */
  async analyzeModuleSystem() {
    const testFiles = [
      'server/index.ts',
      'server/index.js',
      'server/routes.ts',
      'server/routes.js'
    ];

    let moduleType = 'UNKNOWN';
    let hasESImports = false;
    let hasCommonJSRequire = false;

    for (const file of testFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('import ') && content.includes('from ')) {
          hasESImports = true;
        }
        if (content.includes('require(') || content.includes('module.exports')) {
          hasCommonJSRequire = true;
        }
      }
    }

    if (hasESImports && !hasCommonJSRequire) {
      moduleType = 'ES_MODULES';
      this.addSuccess('Projeto usando ES Modules consistentemente');
      this.results.score += 20;
    } else if (hasCommonJSRequire && !hasESImports) {
      moduleType = 'COMMONJS';
      this.addIssue('MAJOR', 'Projeto usando CommonJS', 'Migração para ES Modules recomendada');
      this.addRequirement('Migrar imports: require() → import/export');
    } else if (hasESImports && hasCommonJSRequire) {
      moduleType = 'MIXED';
      this.addIssue('CRITICAL', 'Sistema de módulos misto (ES + CommonJS)', 
        'Padronizar para ES Modules em todos os arquivos');
    }

    this.results.analysis.moduleSystem = {
      type: moduleType,
      hasESImports,
      hasCommonJSRequire
    };
  }

  /**
   * ANÁLISE DO SISTEMA DE ROTAS
   */
  async analyzeRouteSystem() {
    const routeFiles = [
      'server/routes.ts',
      'server/routes.js'
    ];

    let routeSystem = 'NONE';
    let hasRegisterRoutes = false;
    let usesExpress = false;

    for (const file of routeFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('registerRoutes') || content.includes('function registerRoutes')) {
          hasRegisterRoutes = true;
          routeSystem = 'REGISTER_FUNCTION';
        }
        if (content.includes('express') || content.includes('Express')) {
          usesExpress = true;
        }
      }
    }

    this.results.analysis.routeSystem = {
      type: routeSystem,
      hasRegisterRoutes,
      usesExpress
    };

    if (hasRegisterRoutes && usesExpress) {
      this.addSuccess('Sistema de rotas Express configurado');
      this.results.score += 15;
    } else if (!hasRegisterRoutes) {
      this.addIssue('MAJOR', 'Função registerRoutes não encontrada', 
        'Implementar função registerRoutes no servidor');
    }
  }

  /**
   * ANÁLISE DA CONFIGURAÇÃO TYPESCRIPT
   */
  async analyzeTypeScriptConfig() {
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    
    if (fs.existsSync(tsconfigPath)) {
      this.addSuccess('TypeScript configurado');
      this.results.score += 10;
      
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        this.results.analysis.typescript = {
          configured: true,
          config: tsconfig
        };
      } catch (error) {
        this.addIssue('MINOR', 'tsconfig.json inválido', 'Corrigir configuração TypeScript');
      }
    } else {
      this.addIssue('MINOR', 'TypeScript não configurado', 'Adicionar tsconfig.json recomendado');
      this.results.analysis.typescript = { configured: false };
    }
  }

  /**
   * ANÁLISE DE DEPENDÊNCIAS
   */
  async analyzeDependencies() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) return;

    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const allDeps = {
      ...packageData.dependencies || {},
      ...packageData.devDependencies || {}
    };

    const requiredDeps = ['express', 'typescript'];
    const recommendedDeps = ['vite', 'react', 'drizzle-orm'];

    this.results.analysis.dependencies = {
      installed: Object.keys(allDeps),
      required: requiredDeps,
      recommended: recommendedDeps
    };

    const missingRequired = requiredDeps.filter(dep => !allDeps[dep]);
    const missingRecommended = recommendedDeps.filter(dep => !allDeps[dep]);

    if (missingRequired.length === 0) {
      this.addSuccess('Dependências essenciais instaladas');
      this.results.score += 10;
    } else {
      this.addIssue('MAJOR', `Dependências essenciais faltando: ${missingRequired.join(', ')}`, 
        'Instalar dependências necessárias');
    }

    if (missingRecommended.length > 0) {
      this.addIssue('MINOR', `Dependências recomendadas faltando: ${missingRecommended.join(', ')}`, 
        'Considerar instalar para melhor experiência');
    }
  }

  /**
   * VERIFICAR FOUNDATION EXISTENTE
   */
  async checkExistingFoundation() {
    const foundationInstalled = fs.existsSync(path.join(this.projectRoot, '.foundation-installed'));
    const foundationDir = fs.existsSync(this.foundationDir);

    this.results.analysis.existingFoundation = {
      installed: foundationInstalled,
      hasDirectory: foundationDir
    };

    if (foundationInstalled) {
      this.addIssue('INFO', 'Foundation já instalado', 'Use foundation-remove para desinstalar antes de reinstalar');
    }
  }

  /**
   * CALCULAR PONTUAÇÃO
   */
  calculateScore() {
    // Score já calculado durante análises
    this.results.scorePercentage = Math.round((this.results.score / this.results.maxScore) * 100);
  }

  /**
   * GERAR CLASSIFICAÇÃO
   */
  generateClassification() {
    const criticalIssues = this.results.issues.filter(issue => issue.severity === 'CRITICAL').length;
    const majorIssues = this.results.issues.filter(issue => issue.severity === 'MAJOR').length;

    if (criticalIssues > 0) {
      this.results.classification = 'INCOMPATÍVEL';
    } else if (majorIssues > 2) {
      this.results.classification = 'PRECISA_AJUSTES';
    } else if (this.results.score >= 80) {
      this.results.classification = 'COMPATÍVEL';
    } else {
      this.results.classification = 'PRECISA_AJUSTES';
    }
  }

  /**
   * GERAR RECOMENDAÇÕES
   */
  generateRecommendations() {
    switch (this.results.classification) {
      case 'COMPATÍVEL':
        this.results.recommendations.push('✅ Projeto pronto para Foundation');
        this.results.recommendations.push('🚀 Executar: foundation-installer para instalação');
        break;
        
      case 'PRECISA_AJUSTES':
        this.results.recommendations.push('🔧 Executar: foundation-migrator para ajustes automáticos');
        this.results.recommendations.push('📖 Consultar: MIGRATION-GUIDE.md para ajustes manuais');
        this.results.recommendations.push('🧪 Executar scanner novamente após ajustes');
        break;
        
      case 'INCOMPATÍVEL':
        this.results.recommendations.push('❌ Projeto requer modificações significativas');
        this.results.recommendations.push('📖 Consultar: NEW-PROJECT-GUIDE.md para projetos novos');
        this.results.recommendations.push('🔧 Resolver problemas críticos antes de continuar');
        break;
    }
  }

  /**
   * UTILITÁRIOS
   */
  addIssue(severity, message, recommendation) {
    this.results.issues.push({ severity, message, recommendation });
  }

  addSuccess(message) {
    this.results.issues.push({ severity: 'SUCCESS', message });
  }

  addRequirement(requirement) {
    this.results.requirements.push(requirement);
  }

  /**
   * GERAR RELATÓRIO
   */
  generateReport() {
    console.log('\n📊 RELATÓRIO DE ANÁLISE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Classificação
    const classificationColors = {
      'COMPATÍVEL': '🟢',
      'PRECISA_AJUSTES': '🟡', 
      'INCOMPATÍVEL': '🔴'
    };
    
    console.log(`\n${classificationColors[this.results.classification]} Classificação: ${this.results.classification}`);
    console.log(`📊 Pontuação: ${this.results.score}/${this.results.maxScore} (${this.results.scorePercentage}%)`);

    // Issues organizadas por severidade
    const severityOrder = ['CRITICAL', 'MAJOR', 'MINOR', 'INFO', 'SUCCESS'];
    const severityIcons = {
      'CRITICAL': '🚨',
      'MAJOR': '⚠️',
      'MINOR': '💡',
      'INFO': 'ℹ️',
      'SUCCESS': '✅'
    };

    for (const severity of severityOrder) {
      const issuesOfSeverity = this.results.issues.filter(issue => issue.severity === severity);
      if (issuesOfSeverity.length > 0) {
        console.log(`\n${severityIcons[severity]} ${severity}:`);
        issuesOfSeverity.forEach(issue => {
          console.log(`   • ${issue.message}`);
          if (issue.recommendation) {
            console.log(`     → ${issue.recommendation}`);
          }
        });
      }
    }

    // Recomendações
    if (this.results.recommendations.length > 0) {
      console.log('\n🎯 PRÓXIMOS PASSOS:');
      this.results.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }

    // Requisitos
    if (this.results.requirements.length > 0) {
      console.log('\n📋 REQUISITOS PARA FOUNDATION:');
      this.results.requirements.forEach(req => {
        console.log(`   • ${req}`);
      });
    }

    return this.results;
  }
}

/**
 * FUNÇÃO PRINCIPAL EXPORTADA
 */
async function scanProject() {
  const scanner = new FoundationProjectScanner();
  const results = await scanner.scanProject();
  scanner.generateReport();
  
  // Salvar relatório em arquivo
  const reportPath = path.join(scanner.foundationDir, 'scan-report.json');
  if (!fs.existsSync(scanner.foundationDir)) {
    fs.mkdirSync(scanner.foundationDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
  
  return results;
}

// Executar se chamado diretamente
if (require.main === module) {
  scanProject().catch(console.error);
}

module.exports = { FoundationProjectScanner, scanProject };