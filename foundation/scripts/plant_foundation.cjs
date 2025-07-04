#!/usr/bin/env node

/**
 * Plant Foundation Script v3.0
 * Verifica a estrutura completa do sistema foundation
 * Objetivo: Verificar se a "semente" foi plantada corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🌱 Plant Foundation - Verificador de Estrutura');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Estrutura esperada do foundation
const EXPECTED_STRUCTURE = {
  // Arquivos principais
  'package.json': 'file',
  'client/src/App.tsx': 'file',
  'client/src/foundation-setup.tsx': 'file',
  'shared/schema.ts': 'file',
  'server/index.ts': 'file',
  'server/routes-minimal.ts': 'file',
  'server/storage-minimal.ts': 'file',
  
  // Estrutura foundation
  'foundation/': 'directory',
  'foundation/foundation-installer.cjs': 'file',
  'foundation/scripts/': 'directory',
  'foundation/scripts/plant_foundation.cjs': 'file',
  'foundation/config/': 'directory',
  'foundation/docs/': 'directory',
  'foundation/logs/': 'directory',
  'foundation/automation/': 'directory',
  'foundation/.trash/': 'directory',
  'foundation/REPLIT_ORDER_EXECUTION.md': 'file',
  
  // Arquivos de configuração
  'vite.config.ts': 'file',
  'tailwind.config.ts': 'file',
  'drizzle.config.ts': 'file',
  'tsconfig.json': 'file',
};

// Função para verificar se arquivo/diretório existe
function checkPath(itemPath, type) {
  try {
    const stats = fs.statSync(itemPath);
    
    if (type === 'file' && stats.isFile()) {
      return { exists: true, type: 'file', size: stats.size };
    } else if (type === 'directory' && stats.isDirectory()) {
      return { exists: true, type: 'directory' };
    } else {
      return { exists: false, wrongType: true };
    }
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Função para verificar integridade dos arquivos
function verifyFileIntegrity(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificações específicas por arquivo
    if (filePath.includes('App.tsx')) {
      return content.includes('FoundationSetup') && content.includes('/foundation/setup');
    }
    
    if (filePath.includes('foundation-setup.tsx')) {
      return content.includes('DuEuler Foundation') && content.includes('setupSchema');
    }
    
    if (filePath.includes('schema.ts')) {
      return content.includes('systemConfig') && content.includes('users');
    }
    
    if (filePath.includes('routes-minimal.ts')) {
      return content.includes('/api/setup') && content.includes('registerRoutes');
    }
    
    if (filePath.includes('storage-minimal.ts')) {
      return content.includes('DatabaseStorage') && content.includes('IStorage');
    }
    
    return true; // Arquivo existe e tem conteúdo
  } catch (error) {
    return false;
  }
}

// Função principal de verificação
function verifyFoundationStructure() {
  console.log('🔍 Verificando estrutura do foundation...\n');
  
  let totalItems = 0;
  let existingItems = 0;
  let missingItems = [];
  let corruptedItems = [];
  let validItems = [];
  
  for (const [itemPath, expectedType] of Object.entries(EXPECTED_STRUCTURE)) {
    totalItems++;
    
    console.log(`📋 Verificando: ${itemPath}`);
    
    const result = checkPath(itemPath, expectedType);
    
    if (result.exists) {
      existingItems++;
      
      // Verificar integridade se for arquivo
      if (expectedType === 'file') {
        const isIntact = verifyFileIntegrity(itemPath);
        if (isIntact) {
          validItems.push(itemPath);
          console.log(`   ✅ OK - ${result.type} (${result.size || 0} bytes)`);
        } else {
          corruptedItems.push(itemPath);
          console.log(`   ⚠️  CORRUPTED - arquivo existe mas conteúdo inválido`);
        }
      } else {
        validItems.push(itemPath);
        console.log(`   ✅ OK - ${result.type}`);
      }
    } else {
      missingItems.push(itemPath);
      if (result.wrongType) {
        console.log(`   ❌ WRONG TYPE - esperado ${expectedType}`);
      } else {
        console.log(`   ❌ MISSING - não encontrado`);
      }
    }
  }
  
  return {
    totalItems,
    existingItems,
    missingItems,
    corruptedItems,
    validItems,
    completionPercentage: Math.round((existingItems / totalItems) * 100)
  };
}

// Função para gerar relatório
function generateReport(results) {
  console.log('\n📊 RELATÓRIO DE VERIFICAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log(`📈 Progresso: ${results.completionPercentage}% completo`);
  console.log(`✅ Válidos: ${results.validItems.length}/${results.totalItems}`);
  console.log(`❌ Ausentes: ${results.missingItems.length}`);
  console.log(`⚠️  Corrompidos: ${results.corruptedItems.length}`);
  
  if (results.missingItems.length > 0) {
    console.log('\n❌ ITENS AUSENTES:');
    results.missingItems.forEach(item => {
      console.log(`   - ${item}`);
    });
  }
  
  if (results.corruptedItems.length > 0) {
    console.log('\n⚠️  ITENS CORROMPIDOS:');
    results.corruptedItems.forEach(item => {
      console.log(`   - ${item}`);
    });
  }
  
  // Status geral
  console.log('\n🌱 STATUS DA SEMENTE:');
  if (results.completionPercentage === 100 && results.corruptedItems.length === 0) {
    console.log('   🎉 FOUNDATION COMPLETO - Semente plantada com sucesso!');
    console.log('   🚀 Sistema pronto para configuração inicial');
  } else if (results.completionPercentage >= 80) {
    console.log('   🟡 FOUNDATION PARCIAL - Semente plantada, mas incompleta');
    console.log('   🔧 Execute novamente o foundation-installer.cjs');
  } else {
    console.log('   🔴 FOUNDATION INSUFICIENTE - Semente não plantada corretamente');
    console.log('   🛠️  Instalação inicial necessária');
  }
  
  return results.completionPercentage >= 80;
}

// Função para salvar log
function saveVerificationLog(results) {
  const logData = {
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    results: results,
    foundationReady: results.completionPercentage >= 80 && results.corruptedItems.length === 0
  };
  
  const logPath = 'foundation/logs/plant_foundation_verification.json';
  
  // Criar pasta logs se não existir
  if (!fs.existsSync('foundation/logs')) {
    fs.mkdirSync('foundation/logs', { recursive: true });
  }
  
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  console.log(`\n📝 Log salvo em: ${logPath}`);
}

// Execução principal
function main() {
  try {
    const results = verifyFoundationStructure();
    const isReady = generateReport(results);
    saveVerificationLog(results);
    
    // Exit code baseado no resultado
    process.exit(isReady ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyFoundationStructure,
  generateReport,
  EXPECTED_STRUCTURE
};