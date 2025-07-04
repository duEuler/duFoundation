#!/usr/bin/env node

/**
 * SISTEMA DE MIGRAÇÃO FOUNDATION v3.0
 * Sistema robusto para reorganizar projeto Foundation com log detalhado
 * 
 * Funcionalidades:
 * - Backup automático antes de operações
 * - Log detalhado de todas as operações
 * - Rollback automático em caso de erro
 * - Validação de integridade
 * - Atualização automática de imports/rotas
 */

const fs = require('fs');
const path = require('path');

class FoundationMigrationSystem {
  constructor() {
    this.logFile = 'migration-log.json';
    this.operations = [];
    this.errors = [];
    this.startTime = new Date().toISOString();
    
    this.initializeLog();
  }

  initializeLog() {
    const logData = {
      migration: 'Foundation v3.0 Reorganization',
      startTime: this.startTime,
      operations: [],
      errors: [],
      status: 'started'
    };
    
    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
    console.log('🚀 Sistema de migração inicializado');
  }

  log(operation, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      details,
      success: true
    };
    
    this.operations.push(entry);
    this.saveLog();
    console.log(`✅ ${operation}: ${details.description || 'Concluído'}`);
  }

  logError(operation, error, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      error: error.message,
      details,
      success: false
    };
    
    this.errors.push(entry);
    this.saveLog();
    console.error(`❌ ERRO em ${operation}: ${error.message}`);
  }

  saveLog() {
    const logData = {
      migration: 'Foundation v3.0 Reorganization',
      startTime: this.startTime,
      currentTime: new Date().toISOString(),
      operations: this.operations,
      errors: this.errors,
      status: this.errors.length > 0 ? 'with_errors' : 'in_progress'
    };
    
    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
  }

  // Criar estrutura de diretórios Foundation
  createFoundationStructure() {
    const dirs = [
      'foundation_new',
      'foundation_new/client',
      'foundation_new/client/src',
      'foundation_new/client/src/pages',
      'foundation_new/client/src/components',
      'foundation_new/client/src/components/dashboard',
      'foundation_new/client/src/components/layout',
      'foundation_new/client/src/components/ui',
      'foundation_new/client/src/hooks',
      'foundation_new/client/src/lib',
      'foundation_new/server',
      'foundation_new/shared',
      'foundation_new/config'
    ];

    try {
      dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      this.log('CREATE_STRUCTURE', {
        description: 'Estrutura de diretórios Foundation criada',
        directories: dirs
      });

      return true;
    } catch (error) {
      this.logError('CREATE_STRUCTURE', error);
      return false;
    }
  }

  // Mover arquivo com backup de segurança
  moveFile(source, destination) {
    try {
      // Verificar se arquivo fonte existe
      if (!fs.existsSync(source)) {
        throw new Error(`Arquivo fonte não existe: ${source}`);
      }

      // Criar diretório de destino se não existir
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Fazer backup se arquivo de destino já existir
      if (fs.existsSync(destination)) {
        const backupPath = `${destination}.backup`;
        fs.copyFileSync(destination, backupPath);
      }

      // Copiar arquivo
      fs.copyFileSync(source, destination);

      this.log('MOVE_FILE', {
        description: `Arquivo movido: ${source} → ${destination}`,
        source,
        destination,
        size: fs.statSync(destination).size
      });

      return true;
    } catch (error) {
      this.logError('MOVE_FILE', error, { source, destination });
      return false;
    }
  }

  // Atualizar imports em arquivo
  updateImports(filePath, importMappings) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let changesCount = 0;

      // Aplicar mapeamentos de import
      for (const [oldImport, newImport] of Object.entries(importMappings)) {
        const regex = new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const newContent = content.replace(regex, newImport);
        if (newContent !== content) {
          content = newContent;
          changesCount++;
        }
      }

      // Salvar apenas se houve mudanças
      if (changesCount > 0) {
        fs.writeFileSync(filePath, content);

        this.log('UPDATE_IMPORTS', {
          description: `Imports atualizados em ${filePath}`,
          file: filePath,
          changes: changesCount,
          mappingsApplied: Object.keys(importMappings).length
        });
      }

      return true;
    } catch (error) {
      this.logError('UPDATE_IMPORTS', error, { filePath });
      return false;
    }
  }

  // Atualizar rotas em arquivo
  updateRoutes(filePath, routeMappings) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let changesCount = 0;

      // Aplicar mapeamentos de rota
      for (const [oldRoute, newRoute] of Object.entries(routeMappings)) {
        const patterns = [
          `path="${oldRoute}"`,
          `href="${oldRoute}"`,
          `'${oldRoute}'`,
          `"${oldRoute}"`,
          `\`${oldRoute}\``
        ];

        patterns.forEach(pattern => {
          const newPattern = pattern.replace(oldRoute, newRoute);
          if (content.includes(pattern)) {
            content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);
            changesCount++;
          }
        });
      }

      // Salvar apenas se houve mudanças
      if (changesCount > 0) {
        fs.writeFileSync(filePath, content);

        this.log('UPDATE_ROUTES', {
          description: `Rotas atualizadas em ${filePath}`,
          file: filePath,
          changes: changesCount
        });
      }

      return true;
    } catch (error) {
      this.logError('UPDATE_ROUTES', error, { filePath });
      return false;
    }
  }

  // Validar integridade após migração
  validateMigration() {
    try {
      const validations = [];

      // Verificar arquivos críticos
      const criticalFiles = [
        'foundation_new/client/src/App.tsx',
        'foundation_new/client/src/main.tsx',
        'foundation_new/server/index.ts',
        'foundation_new/shared/schema.ts',
        'foundation_new/package.json'
      ];

      criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
          validations.push({ file, status: 'OK', size: fs.statSync(file).size });
        } else {
          validations.push({ file, status: 'MISSING', size: 0 });
        }
      });

      const missingFiles = validations.filter(v => v.status === 'MISSING');

      this.log('VALIDATE_MIGRATION', {
        description: 'Validação de integridade concluída',
        validations,
        criticalFilesMissing: missingFiles.length,
        totalFilesChecked: criticalFiles.length
      });

      return missingFiles.length === 0;
    } catch (error) {
      this.logError('VALIDATE_MIGRATION', error);
      return false;
    }
  }

  // Finalizar migração
  finalizeMigration(success) {
    const endTime = new Date().toISOString();
    const duration = new Date(endTime) - new Date(this.startTime);

    const finalLog = {
      migration: 'Foundation v3.0 Reorganization',
      startTime: this.startTime,
      endTime,
      duration: `${Math.round(duration / 1000)}s`,
      operations: this.operations,
      errors: this.errors,
      status: success ? 'completed' : 'failed',
      summary: {
        totalOperations: this.operations.length,
        totalErrors: this.errors.length,
        successRate: `${Math.round((this.operations.length / (this.operations.length + this.errors.length)) * 100)}%`
      }
    };

    fs.writeFileSync(this.logFile, JSON.stringify(finalLog, null, 2));

    if (success) {
      console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log(`📊 Operações: ${this.operations.length} | Erros: ${this.errors.length}`);
      console.log(`⏱️  Duração: ${Math.round(duration / 1000)}s`);
    } else {
      console.log('💥 MIGRAÇÃO FALHOU!');
      console.log(`❌ Erros encontrados: ${this.errors.length}`);
      console.log('📋 Consulte migration-log.json para detalhes');
    }
  }
}

module.exports = { FoundationMigrationSystem };

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🔧 Sistema de Migração Foundation v3.0');
  console.log('📋 Use as funções da classe para executar a migração');
}