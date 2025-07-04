#!/usr/bin/env node

/**
 * FOUNDATION APP PORTABLE INSTALLER
 * Script para instalar Foundation App em qualquer projeto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Foundation App Portable Installer');
console.log('====================================\n');

// Verificar se Node.js está disponível
try {
  execSync('node --version', { stdio: 'pipe' });
  console.log('✅ Node.js disponível');
} catch {
  console.error('❌ Node.js não encontrado. Instale Node.js primeiro.');
  process.exit(1);
}

// Verificar se pasta foundation existe
if (!fs.existsSync('./foundation')) {
  console.error('❌ Pasta foundation não encontrada neste projeto.');
  console.log('📋 Copie a pasta foundation completa para este projeto primeiro.');
  process.exit(1);
}

// Verificar se aplicação já está instalada
if (fs.existsSync('./foundation/_app')) {
  console.log('⚠️  Aplicação Foundation já instalada em foundation/_app/');
  console.log('💡 Para reinstalar, remova a pasta foundation/_app/ primeiro.');
  
  // Mostrar informações da instalação
  if (fs.existsSync('./foundation/FOUNDATION_APP_INSTALLED.md')) {
    const content = fs.readFileSync('./foundation/FOUNDATION_APP_INSTALLED.md', 'utf8');
    const versionMatch = content.match(/Version: (.+)/);
    const dateMatch = content.match(/Date: (.+)/);
    
    if (versionMatch) console.log('📦 Versão: ' + versionMatch[1]);
    if (dateMatch) console.log('📅 Data: ' + dateMatch[1]);
  }
  
  console.log('\n📋 Comandos disponíveis:');
  console.log('- Instalar dependências: cd foundation/_app && npm install');
  console.log('- Executar aplicação: cd foundation/_app && npm run dev');
  console.log('- Executar migrações: cd foundation/_app && npm run db:push');
  
  process.exit(0);
}

console.log('❌ Aplicação Foundation não está instalada.');
console.log('📋 Execute o instalador primeiro no projeto original.');
console.log('💡 Ou copie a pasta foundation/_app/ completa para este projeto.');

console.log('\n📋 Estrutura necessária:');
console.log('foundation/');
console.log('├── _app/                 # Aplicação Foundation');
console.log('├── FOUNDATION_APP_INSTALLED.md');
console.log('└── install-foundation-app.cjs');

process.exit(1);