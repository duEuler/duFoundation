#!/usr/bin/env node

/**
 * FOUNDATION APP INSTALLER v3.0
 * Sistema inteligente de instalação/migração da aplicação Foundation
 */

const fs = require('fs');
const path = require('path');

class FoundationAppInstaller {
  constructor() {
    this.logFile = 'foundation-install-log.json';
    this.foundationPath = './foundation';
    this.appPath = './foundation/_app';
    this.sourcePath = './foundation_new';
    this.operations = [];
    this.errors = [];
    this.conflicts = [];
    this.startTime = new Date().toISOString();
    
    this.initializeLog();
  }

  initializeLog() {
    const logData = {
      installer: 'Foundation App Installer v3.0',
      startTime: this.startTime,
      operations: [],
      errors: [],
      conflicts: [],
      status: 'started'
    };
    
    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
    console.log('🚀 Foundation App Installer v3.0 inicializado');
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
    console.log('✅ ' + operation + ': ' + (details.description || 'Concluído'));
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
    console.error('❌ ERRO em ' + operation + ': ' + error.message);
  }

  logConflict(filePath, reason) {
    const conflict = {
      timestamp: new Date().toISOString(),
      file: filePath,
      reason,
      action: 'skipped'
    };
    
    this.conflicts.push(conflict);
    this.saveLog();
    console.warn('⚠️  CONFLITO: ' + filePath + ' - ' + reason);
  }

  saveLog() {
    const logData = {
      installer: 'Foundation App Installer v3.0',
      startTime: this.startTime,
      currentTime: new Date().toISOString(),
      operations: this.operations,
      errors: this.errors,
      conflicts: this.conflicts,
      status: this.errors.length > 0 ? 'with_errors' : 'in_progress'
    };
    
    fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
  }

  // Verificar se aplicação Foundation já está instalada
  checkInstallationStatus() {
    try {
      const indicators = [
        this.appPath + '/package.json',
        this.appPath + '/client/src/App.tsx',
        this.appPath + '/server/index.ts',
        this.foundationPath + '/FOUNDATION_APP_INSTALLED.md'
      ];

      const installed = indicators.some(file => fs.existsSync(file));
      
      if (installed) {
        const installMarker = this.foundationPath + '/FOUNDATION_APP_INSTALLED.md';
        let installInfo = { version: 'unknown', date: 'unknown' };
        
        if (fs.existsSync(installMarker)) {
          try {
            const content = fs.readFileSync(installMarker, 'utf8');
            const versionMatch = content.match(/Version: (.+)/);
            const dateMatch = content.match(/Date: (.+)/);
            
            installInfo = {
              version: versionMatch ? versionMatch[1] : 'unknown',
              date: dateMatch ? dateMatch[1] : 'unknown'
            };
          } catch {}
        }

        this.log('CHECK_INSTALLATION', {
          description: 'Aplicação Foundation já instalada',
          installed: true,
          version: installInfo.version,
          date: installInfo.date
        });

        return {
          installed: true,
          version: installInfo.version,
          date: installInfo.date
        };
      }

      this.log('CHECK_INSTALLATION', {
        description: 'Aplicação Foundation não instalada',
        installed: false
      });

      return { installed: false };

    } catch (error) {
      this.logError('CHECK_INSTALLATION', error);
      return { installed: false, error: true };
    }
  }

  // Criar estrutura da aplicação Foundation
  createAppStructure() {
    try {
      const dirs = [
        this.appPath,
        this.appPath + '/client',
        this.appPath + '/client/src',
        this.appPath + '/client/src/pages',
        this.appPath + '/client/src/components',
        this.appPath + '/client/src/hooks',
        this.appPath + '/client/src/lib',
        this.appPath + '/server',
        this.appPath + '/shared',
        this.appPath + '/config'
      ];

      dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      this.log('CREATE_APP_STRUCTURE', {
        description: 'Estrutura da aplicação Foundation criada',
        directories: dirs.length
      });

      return true;

    } catch (error) {
      this.logError('CREATE_APP_STRUCTURE', error);
      return false;
    }
  }

  // Mover arquivos evitando conflitos
  moveAppFiles() {
    try {
      if (!fs.existsSync(this.sourcePath)) {
        throw new Error('Diretório fonte não encontrado: ' + this.sourcePath);
      }

      let movedCount = 0;
      let skippedCount = 0;

      const moveDirectory = (srcDir, tgtDir) => {
        if (!fs.existsSync(srcDir)) return;

        const items = fs.readdirSync(srcDir);

        items.forEach(item => {
          const srcPath = path.join(srcDir, item);
          const tgtPath = path.join(tgtDir, item);

          if (fs.statSync(srcPath).isDirectory()) {
            // Criar diretório se não existir
            if (!fs.existsSync(tgtPath)) {
              fs.mkdirSync(tgtPath, { recursive: true });
            }
            moveDirectory(srcPath, tgtPath);
          } else {
            // Verificar se arquivo já existe
            if (fs.existsSync(tgtPath)) {
              this.logConflict(tgtPath, 'Arquivo já existe - pulando');
              skippedCount++;
            } else {
              // Copiar arquivo
              fs.copyFileSync(srcPath, tgtPath);
              movedCount++;
            }
          }
        });
      };

      moveDirectory(this.sourcePath, this.appPath);

      this.log('MOVE_APP_FILES', {
        description: 'Arquivos da aplicação movidos',
        moved: movedCount,
        skipped: skippedCount
      });

      return true;

    } catch (error) {
      this.logError('MOVE_APP_FILES', error);
      return false;
    }
  }

  // Criar marcador de instalação
  createInstallationMarker() {
    try {
      const marker = '# FOUNDATION APP INSTALAÇÃO\n\n' +
        '## Informações da Instalação\n\n' +
        '- **Version:** 3.0\n' +
        '- **Date:** ' + new Date().toISOString() + '\n' +
        '- **Installer:** Foundation App Installer v3.0\n' +
        '- **Location:** foundation/_app/\n\n' +
        '## Estrutura Instalada\n\n' +
        '- Frontend React em `foundation/_app/client/`\n' +
        '- Backend Node.js em `foundation/_app/server/`\n' +
        '- Modelos de dados em `foundation/_app/shared/`\n' +
        '- Configurações em `foundation/_app/config/`\n\n' +
        '## Rotas Foundation\n\n' +
        '- `/foundation/` → Dashboard principal\n' +
        '- `/foundation/login` → Autenticação\n' +
        '- `/foundation/setup` → Configuração inicial\n' +
        '- `/foundation/capacities` → Gestão de capacidades\n' +
        '- `/foundation/dependencies` → Gestão de dependências\n\n' +
        '## Comandos Úteis\n\n' +
        '### Instalar dependências:\n' +
        '```bash\n' +
        'cd foundation/_app && npm install\n' +
        '```\n\n' +
        '### Executar aplicação:\n' +
        '```bash\n' +
        'cd foundation/_app && npm run dev\n' +
        '```\n\n' +
        '### Executar migrações:\n' +
        '```bash\n' +
        'cd foundation/_app && npm run db:push\n' +
        '```\n\n' +
        '## Migração para Outro Projeto\n\n' +
        '1. Copie toda a pasta `foundation/` para o novo projeto\n' +
        '2. Execute: `node foundation/install-foundation-app.cjs`\n' +
        '3. Configure variáveis de ambiente necessárias\n' +
        '4. Execute: `npm install` na pasta `foundation/_app/`\n';

      fs.writeFileSync(this.foundationPath + '/FOUNDATION_APP_INSTALLED.md', marker);

      this.log('CREATE_INSTALLATION_MARKER', {
        description: 'Marcador de instalação criado',
        file: this.foundationPath + '/FOUNDATION_APP_INSTALLED.md'
      });

      return true;

    } catch (error) {
      this.logError('CREATE_INSTALLATION_MARKER', error);
      return false;
    }
  }

  // Executar instalação completa
  async executeInstallation(options = {}) {
    const { force = false } = options;

    console.log('🏗️  INSTALAÇÃO FOUNDATION APP v3.0');
    console.log('===================================\n');

    try {
      // 1. Verificar status da instalação
      const installStatus = this.checkInstallationStatus();

      if (installStatus.installed && !force) {
        console.log('⚠️  APLICAÇÃO JÁ INSTALADA!');
        console.log('📅 Instalada em: ' + installStatus.date);
        console.log('📦 Versão: ' + installStatus.version);
        console.log('\n💡 Opções:');
        console.log('- Para forçar reinstalação: --force');
        console.log('- Para desinstalar: rm -rf foundation/_app/');
        console.log('- Localização atual: foundation/_app/');
        return false;
      }

      if (force && installStatus.installed) {
        console.log('🔄 REINSTALAÇÃO FORÇADA - removendo instalação anterior...');
        if (fs.existsSync(this.appPath)) {
          fs.rmSync(this.appPath, { recursive: true, force: true });
        }
      }

      // 2. Criar estrutura
      if (!this.createAppStructure()) {
        throw new Error('Falha ao criar estrutura da aplicação');
      }

      // 3. Mover arquivos
      if (!this.moveAppFiles()) {
        throw new Error('Falha ao mover arquivos da aplicação');
      }

      // 4. Criar marcador de instalação
      if (!this.createInstallationMarker()) {
        throw new Error('Falha ao criar marcador de instalação');
      }

      // 5. Finalizar
      this.finalizeInstallation(true);
      return true;

    } catch (error) {
      console.error('💥 ERRO NA INSTALAÇÃO: ' + error.message);
      this.logError('INSTALLATION_FAILED', error);
      this.finalizeInstallation(false);
      return false;
    }
  }

  // Finalizar instalação
  finalizeInstallation(success) {
    const endTime = new Date().toISOString();
    const duration = new Date(endTime) - new Date(this.startTime);

    const finalLog = {
      installer: 'Foundation App Installer v3.0',
      startTime: this.startTime,
      endTime,
      duration: Math.round(duration / 1000) + 's',
      operations: this.operations,
      errors: this.errors,
      conflicts: this.conflicts,
      status: success ? 'completed' : 'failed',
      summary: {
        totalOperations: this.operations.length,
        totalErrors: this.errors.length,
        totalConflicts: this.conflicts.length
      }
    };

    fs.writeFileSync(this.logFile, JSON.stringify(finalLog, null, 2));

    if (success) {
      console.log('\n🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('📁 Aplicação instalada em: foundation/_app/');
      console.log('📋 Marcador criado: foundation/FOUNDATION_APP_INSTALLED.md');
      console.log('📊 Operações: ' + this.operations.length + ' | Erros: ' + this.errors.length + ' | Conflitos: ' + this.conflicts.length);
      console.log('⏱️  Duração: ' + Math.round(duration / 1000) + 's');
      
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. cd foundation/_app && npm install');
      console.log('2. Configurar variáveis de ambiente');
      console.log('3. npm run dev (para executar)');
      console.log('4. Acessar /foundation/ no navegador');
    } else {
      console.log('\n💥 INSTALAÇÃO FALHOU!');
      console.log('❌ Erros encontrados: ' + this.errors.length);
      console.log('📋 Consulte foundation-install-log.json para detalhes');
    }
  }
}

module.exports = { FoundationAppInstaller };

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  const installer = new FoundationAppInstaller();
  installer.executeInstallation({ force });
}