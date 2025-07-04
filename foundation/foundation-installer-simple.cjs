#!/usr/bin/env node

/**
 * Foundation Installer Simple v3.0
 * Instalador direto para uso com foundation-detector
 * 
 * Funcionalidades:
 * - Instalação direta sem perguntas (detector já confirmou)
 * - Instala apenas arquivos essenciais
 * - Integração com sistema de detecção
 */

const FoundationDetector = require('./foundation-detector.cjs');

async function main() {
  console.log('🚀 Foundation Installer Simple - Iniciando...');
  
  const detector = new FoundationDetector();
  
  // Força instalação diretamente
  await detector.installFoundation();
}

// Executa apenas se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro na instalação:', error.message);
    process.exit(1);
  });
}