#!/usr/bin/env node

/**
 * duEuler Foundation v3.0 - Validador de Isolamento Arquitetural
 * 
 * Script para validar que o foundation/_app mantém isolamento completo
 * da aplicação hospedeira, garantindo integridade arquitetural.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 duEuler Foundation v3.0 - Validador de Isolamento');
console.log('=====================================================');

let violations = 0;
let warnings = 0;

/**
 * Verifica imports externos proibidos
 */
function checkExternalImports() {
  console.log('\n1. Verificando imports externos...');
  
  // Verificar apenas dentro do dashboard
  const files = getAllTSXFiles('./');
  const externalImports = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Detectar imports @/ que apontam para fora
      if (line.includes('from "@/') && !line.includes('@shared') && !line.includes('@/components/ui') && !line.includes('@/lib/utils')) {
        externalImports.push({
          file: file,
          line: index + 1,
          import: line.trim()
        });
      }
      
      // Detectar imports relativos que saem do foundation/_app
      if (line.includes('from "../../..')) {
        externalImports.push({
          file: file,
          line: index + 1,
          import: line.trim()
        });
      }
    });
  });
  
  if (externalImports.length === 0) {
    console.log('✅ Nenhum import externo detectado');
  } else {
    console.log(`❌ ${externalImports.length} imports externos encontrados:`);
    externalImports.forEach(item => {
      console.log(`   ${item.file}:${item.line} - ${item.import}`);
    });
    violations += externalImports.length;
  }
}

/**
 * Verifica componentes UI internos
 */
function checkUIComponents() {
  console.log('\n2. Verificando componentes UI...');
  
  const uiPath = './client/src/components/ui';
  if (!fs.existsSync(uiPath)) {
    console.log('❌ Pasta components/ui não encontrada');
    violations++;
    return;
  }
  
  const uiFiles = fs.readdirSync(uiPath).filter(f => f.endsWith('.tsx'));
  console.log(`✅ ${uiFiles.length} componentes UI encontrados`);
  
  if (uiFiles.length < 40) {
    console.log(`⚠️  Esperados pelo menos 47 componentes, encontrados ${uiFiles.length}`);
    warnings++;
  }
  
  // Verificar se componentes UI usam imports internos
  let uiViolations = 0;
  uiFiles.forEach(file => {
    const content = fs.readFileSync(path.join(uiPath, file), 'utf8');
    if (content.includes('from "@/lib/utils"')) {
      console.log(`❌ ${file} ainda usa import externo @/lib/utils`);
      uiViolations++;
    }
  });
  
  if (uiViolations === 0) {
    console.log('✅ Todos os componentes UI usam imports internos');
  } else {
    violations += uiViolations;
  }
}

/**
 * Verifica dependências isoladas
 */
function checkDependencies() {
  console.log('\n3. Verificando dependências...');
  
  if (!fs.existsSync('./package.json')) {
    console.log('❌ package.json não encontrado');
    violations++;
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const depCount = Object.keys(pkg.dependencies || {}).length;
  
  console.log(`✅ ${depCount} dependências próprias encontradas`);
  
  if (!fs.existsSync('./node_modules')) {
    console.log('⚠️  node_modules não encontrado - execute npm install');
    warnings++;
  } else {
    console.log('✅ node_modules isolado presente');
  }
}

/**
 * Verifica configurações independentes
 */
function checkConfigurations() {
  console.log('\n4. Verificando configurações...');
  
  const configs = [
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.ts',
    'drizzle.config.ts'
  ];
  
  configs.forEach(config => {
    if (fs.existsSync(`./${config}`)) {
      console.log(`✅ ${config} independente encontrado`);
    } else {
      console.log(`⚠️  ${config} não encontrado`);
      warnings++;
    }
  });
}

/**
 * Verifica schema database próprio
 */
function checkSchema() {
  console.log('\n5. Verificando schema database...');
  
  if (!fs.existsSync('./shared/schema.ts')) {
    console.log('❌ Schema próprio não encontrado');
    violations++;
    return;
  }
  
  const schema = fs.readFileSync('./shared/schema.ts', 'utf8');
  const tables = (schema.match(/pgTable\(/g) || []).length;
  
  console.log(`✅ Schema próprio com ${tables} tabelas encontrado`);
}

/**
 * Obtém todos os arquivos TypeScript/React
 */
function getAllTSXFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
        walk(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });
  }
  
  walk(dir);
  return files;
}

/**
 * Executa validação completa
 */
function runValidation() {
  checkExternalImports();
  checkUIComponents();
  checkDependencies();
  checkConfigurations();
  checkSchema();
  
  console.log('\n=====================================================');
  console.log('📊 RELATÓRIO DE ISOLAMENTO');
  console.log('=====================================================');
  
  if (violations === 0 && warnings === 0) {
    console.log('🎉 ISOLAMENTO PERFEITO - Nenhuma violação detectada!');
    console.log('✅ Foundation/_app está 100% isolado e independente');
  } else if (violations === 0) {
    console.log(`⚠️  ISOLAMENTO OK com ${warnings} avisos menores`);
    console.log('✅ Nenhuma violação crítica detectada');
  } else {
    console.log(`❌ VIOLAÇÕES CRÍTICAS DETECTADAS: ${violations}`);
    console.log(`⚠️  Avisos: ${warnings}`);
    console.log('\n🚨 AÇÃO NECESSÁRIA: Corrigir violações antes de prosseguir');
  }
  
  console.log('\n📋 Status Foundation v3.0:');
  console.log(`   Violações: ${violations}`);
  console.log(`   Avisos: ${warnings}`);
  console.log(`   Data: ${new Date().toLocaleDateString('pt-BR')}`);
  
  process.exit(violations > 0 ? 1 : 0);
}

// Executar validação
runValidation();