#!/usr/bin/env node

/**
 * Instalar dependências Foundation App
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Instalando dependências Foundation App...');

try {
  // Verificar se pasta existe
  if (!fs.existsSync('./foundation/_app')) {
    console.error('❌ Pasta foundation/_app não encontrada');
    process.exit(1);
  }

  // Instalar dependências
  process.chdir('./foundation/_app');
  console.log('📍 Entrando em foundation/_app/');
  
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas com sucesso!');
  
  console.log('\n🚀 Para executar a aplicação:');
  console.log('cd foundation/_app && npm run dev');
  
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}