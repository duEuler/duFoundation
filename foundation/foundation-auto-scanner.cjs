#!/usr/bin/env node

/**
 * Foundation Auto Scanner v3.0
 * Execução automática UMA ÚNICA VEZ após descompactação
 * 
 * COMPORTAMENTO:
 * - Executa automaticamente apenas na primeira vez
 * - Cria flag .foundation-scanned para evitar re-execução
 * - Removido durante desinstalação
 * - Apenas LÊ o projeto (operação segura)
 */

const { existsSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const FLAG_FILE = '.foundation-scanned';

class FoundationAutoScanner {
  constructor() {
    this.flagPath = path.resolve(FLAG_FILE);
    this.scannerPath = path.resolve('foundation/foundation-scanner.cjs');
  }

  /**
   * Verifica se já foi executado antes
   */
  hasBeenExecuted() {
    return existsSync(this.flagPath);
  }

  /**
   * Cria flag para evitar re-execução
   */
  createFlag() {
    const flagData = {
      scannedAt: new Date().toISOString(),
      version: '3.0.0',
      automatic: true,
      note: 'Flag criado pelo auto-scanner. Removido durante desinstalação.'
    };
    
    writeFileSync(this.flagPath, JSON.stringify(flagData, null, 2));
  }

  /**
   * Executa o scanner original
   */
  runScanner() {
    try {
      console.log('🔍 Foundation Auto Scanner v3.0');
      console.log('📊 Executando análise automática inicial...\n');
      
      // Executa o scanner original
      const result = execSync(`node "${this.scannerPath}"`, { 
        encoding: 'utf8',
        stdio: 'inherit'
      });
      
      console.log('\n✅ Análise automática concluída!');
      console.log('📝 Para próximas análises, execute manualmente:');
      console.log('   node foundation/foundation-scanner.cjs\n');
      
      return true;
    } catch (error) {
      console.error('❌ Erro durante análise automática:', error.message);
      return false;
    }
  }

  /**
   * Função principal
   */
  run() {
    // Verificar se já foi executado
    if (this.hasBeenExecuted()) {
      console.log('ℹ️  Scanner automático já foi executado anteriormente.');
      console.log('   Para nova análise, execute: node foundation/foundation-scanner.cjs');
      return;
    }

    // Verificar se scanner existe
    if (!existsSync(this.scannerPath)) {
      console.error('❌ Scanner não encontrado:', this.scannerPath);
      return;
    }

    console.log('🎯 Primeira execução detectada - executando scanner automático...');
    
    // Executar scanner
    const success = this.runScanner();
    
    if (success) {
      // Criar flag para evitar re-execução
      this.createFlag();
      console.log('🏁 Scanner automático finalizado. Não executará novamente.');
    }
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  const autoScanner = new FoundationAutoScanner();
  autoScanner.run();
}

module.exports = { FoundationAutoScanner };