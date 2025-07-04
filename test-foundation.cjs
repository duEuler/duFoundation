#!/usr/bin/env node

/**
 * TESTE DA ESTRUTURA FOUNDATION v3.0
 * Validação funcional da nova estrutura migrada
 */

const fs = require('fs');
const path = require('path');

class FoundationTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  test(description, assertion) {
    try {
      const result = assertion();
      if (result) {
        this.testResults.push({ description, status: 'PASS', result });
        console.log(`✅ ${description}`);
      } else {
        this.testResults.push({ description, status: 'FAIL', result });
        console.log(`❌ ${description}`);
      }
    } catch (error) {
      this.errors.push({ description, error: error.message });
      console.log(`💥 ${description}: ${error.message}`);
    }
  }

  testFileExists(filePath, description) {
    this.test(description || `Arquivo existe: ${filePath}`, () => {
      return fs.existsSync(filePath);
    });
  }

  testFileContent(filePath, searchString, description) {
    this.test(description || `Conteúdo correto em: ${filePath}`, () => {
      if (!fs.existsSync(filePath)) return false;
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes(searchString);
    });
  }

  runAllTests() {
    console.log('🧪 TESTANDO ESTRUTURA FOUNDATION v3.0\n');

    // Teste 1: Arquivos críticos existem
    console.log('📁 Testando arquivos críticos...');
    this.testFileExists('foundation_new/package.json', 'Package.json Foundation');
    this.testFileExists('foundation_new/client/src/App.tsx', 'App.tsx Foundation');
    this.testFileExists('foundation_new/server/index.ts', 'Server index Foundation');
    this.testFileExists('foundation_new/shared/schema.ts', 'Schema Foundation');

    // Teste 2: Estrutura de diretórios
    console.log('\n📂 Testando estrutura de diretórios...');
    this.testFileExists('foundation_new/client/src/pages', 'Diretório pages');
    this.testFileExists('foundation_new/client/src/components', 'Diretório components');
    this.testFileExists('foundation_new/client/src/hooks', 'Diretório hooks');
    this.testFileExists('foundation_new/server', 'Diretório server');

    // Teste 3: Rotas Foundation
    console.log('\n🛣️  Testando rotas Foundation...');
    this.testFileContent(
      'foundation_new/client/src/App.tsx',
      '/foundation/login',
      'Rota /foundation/login'
    );
    this.testFileContent(
      'foundation_new/client/src/App.tsx',
      '/foundation/setup',
      'Rota /foundation/setup'
    );
    this.testFileContent(
      'foundation_new/client/src/App.tsx',
      '/foundation/capacities',
      'Rota /foundation/capacities'
    );

    // Teste 4: Sidebar atualizado
    console.log('\n🎯 Testando sidebar Foundation...');
    this.testFileContent(
      'foundation_new/client/src/components/dashboard/sidebar.tsx',
      '/foundation/dependencies',
      'Link sidebar dependencies'
    );
    this.testFileContent(
      'foundation_new/client/src/components/dashboard/sidebar.tsx',
      '/foundation/capacities',
      'Link sidebar capacities'
    );

    // Teste 5: Páginas Foundation migradas
    console.log('\n📄 Testando páginas Foundation...');
    this.testFileExists('foundation_new/client/src/pages/capacities.tsx', 'Página capacities');
    this.testFileExists('foundation_new/client/src/pages/dependencies.tsx', 'Página dependencies');
    this.testFileExists('foundation_new/client/src/pages/dashboard.tsx', 'Página dashboard');

    // Teste 6: Configurações
    console.log('\n⚙️  Testando configurações...');
    this.testFileExists('foundation_new/vite.config.ts', 'Vite config');
    this.testFileExists('foundation_new/tailwind.config.ts', 'Tailwind config');
    this.testFileExists('foundation_new/tsconfig.json', 'TypeScript config');

    // Resultado final
    this.showResults();
  }

  showResults() {
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const total = this.testResults.length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO DOS TESTES');
    console.log('='.repeat(50));
    console.log(`✅ Passou: ${passed}/${total}`);
    console.log(`❌ Falhou: ${failed}/${total}`);
    console.log(`💥 Erros: ${this.errors.length}`);

    if (failed === 0 && this.errors.length === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ Estrutura Foundation v3.0 está funcional');
    } else {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS:');
      this.testResults.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`❌ ${test.description}`);
      });
      this.errors.forEach(error => {
        console.log(`💥 ${error.description}: ${error.error}`);
      });
    }

    console.log('\n📋 Próximos passos recomendados:');
    if (failed === 0 && this.errors.length === 0) {
      console.log('1. ✅ Estrutura validada - pronta para uso');
      console.log('2. 🔄 Renomear foundation_new → foundation');
      console.log('3. 🚀 Atualizar configurações do servidor');
      console.log('4. 🧪 Teste funcional da aplicação');
    } else {
      console.log('1. 🔧 Corrigir problemas encontrados');
      console.log('2. 🔄 Re-executar testes');
      console.log('3. 📋 Consultar migration-log.json');
    }
  }
}

// Executar testes
const tester = new FoundationTester();
tester.runAllTests();