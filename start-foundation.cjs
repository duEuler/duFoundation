#!/usr/bin/env node

/**
 * Iniciar Aplicação Foundation
 * Script para executar a aplicação Foundation na estrutura organizada
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando Foundation App v3.0...');

try {
  // Verificar se Foundation App está instalado
  if (!fs.existsSync('./foundation/_app')) {
    console.error('❌ Foundation App não está instalado');
    console.log('💡 Execute: node foundation-app-installer-fixed.cjs');
    process.exit(1);
  }

  // Verificar se dependências estão instaladas
  if (!fs.existsSync('./foundation/_app/node_modules')) {
    console.error('❌ Dependências não instaladas');
    console.log('📦 Instalando dependências...');
    process.chdir('./foundation/_app');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Mudar para diretório Foundation
  process.chdir('./foundation/_app');
  console.log('📍 Executando em foundation/_app/');
  
  // Iniciar aplicação
  console.log('🏃‍♂️ Executando: npm run dev');
  execSync('npm run dev', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro ao iniciar Foundation App:', error.message);
  process.exit(1);
}