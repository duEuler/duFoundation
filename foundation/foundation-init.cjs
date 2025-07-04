#!/usr/bin/env node

/**
 * Foundation Init v3.0
 * Script de inicialização que executa automaticamente na primeira vez
 * 
 * COMPORTAMENTO:
 * - Detecta se é a primeira execução após descompactação
 * - Executa auto-scanner automaticamente apenas uma vez
 * - Cria flag para evitar re-execução
 * - Operação completamente segura (apenas leitura)
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const FLAG_FILE = '.foundation-scanned';
const AUTO_SCANNER = 'foundation/foundation-auto-scanner.cjs';

class FoundationInit {
  constructor() {
    this.flagPath = path.resolve(FLAG_FILE);
    this.autoScannerPath = path.resolve(AUTO_SCANNER);
  }

  /**
   * Verifica se é primeira execução
   */
  isFirstRun() {
    return !existsSync(this.flagPath);
  }

  /**
   * Executa o auto-scanner
   */
  runAutoScanner() {
    try {
      console.log('🚀 Foundation v3.0 - Primeira execução detectada');
      console.log('🔍 Executando análise automática inicial...\n');
      
      execSync(`node "${this.autoScannerPath}"`, { 
        stdio: 'inherit'
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro durante inicialização:', error.message);
      return false;
    }
  }

  /**
   * Função principal
   */
  init() {
    // Verificar se auto-scanner existe
    if (!existsSync(this.autoScannerPath)) {
      console.log('ℹ️  Auto-scanner não encontrado. Sistema em modo manual.');
      return;
    }

    // Verificar se é primeira execução
    if (!this.isFirstRun()) {
      console.log('ℹ️  Foundation já foi inicializado anteriormente.');
      console.log('   Para nova análise, execute: node foundation/foundation-scanner.cjs');
      return;
    }

    // Executar auto-scanner
    this.runAutoScanner();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const foundationInit = new FoundationInit();
  foundationInit.init();
}

export { FoundationInit };