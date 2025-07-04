#!/usr/bin/env node

/**
 * Foundation Remover v3.0
 * Sistema de desinstalação completa e segura
 * 
 * Funcionalidades:
 * - Remove todos os arquivos instalados pelo foundation
 * - Limpa rotas e configurações
 * - Remove markers de controle
 * - Backup de segurança antes da remoção
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class FoundationRemover {
  constructor() {
    // Detecta se está rodando dentro da pasta foundation ou na raiz
    this.foundationDir = __dirname;
    this.projectRoot = path.resolve(__dirname, '..');
    
    // Arquivos de controle
    this.foundationMarker = '.foundation-installed';
    this.foundationIgnore = '.foundation-ignore';
    
    // Paths importantes
    this.markerPath = path.join(this.projectRoot, this.foundationMarker);
    this.ignorePath = path.join(this.projectRoot, this.foundationIgnore);
    
    console.log('🗑️  Foundation Remover v3.0 - Iniciando...');
  }

  async remove() {
    try {
      // Verifica se está instalado
      if (!this.isInstalled()) {
        console.log('⚠️  Foundation não está instalado neste projeto');
        console.log('💡 Nada para remover');
        return;
      }

      // Pergunta confirmação
      await this.askConfirmation();

    } catch (error) {
      console.error('❌ Erro no Foundation Remover:', error.message);
      process.exit(1);
    }
  }

  isInstalled() {
    return fs.existsSync(this.markerPath);
  }

  async askConfirmation() {
    console.log('\n🚨 Foundation Remover - ATENÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Esta operação irá REMOVER COMPLETAMENTE o Foundation deste projeto');
    console.log('');
    console.log('📋 O que será removido:');
    console.log('   ❌ Rota /foundation/setup');
    console.log('   ❌ Arquivos de configuração');
    console.log('   ❌ Scripts e templates instalados');
    console.log('   ❌ Markers de controle');
    console.log('');
    console.log('✅ Será criado backup de segurança antes da remoção');
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('🤔 Confirma a remoção COMPLETA? (S/N): ', async (answer) => {
        rl.close();
        
        const choice = answer.toUpperCase().trim();
        console.log('');

        if (choice === 'S' || choice === 'SIM') {
          console.log('✅ Remoção confirmada! Iniciando...');
          await this.performRemoval();
        } else {
          console.log('⏭️  Remoção cancelada');
        }
        
        resolve();
      });
    });
  }

  async performRemoval() {
    try {
      console.log('📦 Iniciando remoção do Foundation...');
      
      // 1. Cria backup de segurança
      await this.createBackup();
      
      // 2. Lê lista de arquivos instalados
      const installedFiles = await this.getInstalledFiles();
      
      // 3. Remove arquivos um por um
      await this.removeInstalledFiles(installedFiles);
      
      // 4. Limpa rotas
      await this.cleanupRoutes();
      
      // 5. Remove markers
      await this.removeMarkers();
      
      // 6. Mostra resultado final
      this.showCompletionMessage();

    } catch (error) {
      console.error('❌ Erro durante remoção:', error.message);
      console.log('💡 Backup de segurança preservado');
    }
  }

  async createBackup() {
    console.log('💾 Criando backup de segurança...');
    
    const backupDir = path.join(this.foundationDir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `foundation-removal-backup-${timestamp}.json`);

    const backupData = {
      timestamp: new Date().toISOString(),
      action: 'foundation-removal',
      projectRoot: this.projectRoot,
      markerData: null,
      files: []
    };

    // Backup do marker se existir
    if (fs.existsSync(this.markerPath)) {
      try {
        backupData.markerData = JSON.parse(fs.readFileSync(this.markerPath, 'utf8'));
      } catch (error) {
        backupData.markerData = { error: 'Could not parse marker file' };
      }
    }

    // Lista arquivos que serão removidos
    const filesToBackup = await this.getInstalledFiles();
    
    for (const file of filesToBackup) {
      const fullPath = path.join(this.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          backupData.files.push({
            path: file,
            content: content,
            size: content.length
          });
        } catch (error) {
          backupData.files.push({
            path: file,
            error: 'Could not read file',
            size: 0
          });
        }
      }
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`   ✓ Backup salvo: ${path.basename(backupFile)}`);
  }

  async getInstalledFiles() {
    const files = [];

    // Arquivos padrão que são sempre instalados
    const defaultFiles = [
      'server/routes/foundation-setup.js'
    ];

    // Lê lista do marker se existir
    if (fs.existsSync(this.markerPath)) {
      try {
        const markerData = JSON.parse(fs.readFileSync(this.markerPath, 'utf8'));
        if (markerData.files && Array.isArray(markerData.files)) {
          files.push(...markerData.files);
        }
      } catch (error) {
        console.log('⚠️  Não foi possível ler lista de arquivos do marker');
      }
    }

    // Adiciona arquivos padrão
    files.push(...defaultFiles);

    // Remove duplicatas
    return [...new Set(files)];
  }

  async removeInstalledFiles(files) {
    console.log('🗑️  Removendo arquivos instalados...');

    let removedCount = 0;
    let notFoundCount = 0;

    for (const file of files) {
      const fullPath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`   ❌ ${file}`);
          removedCount++;
        } catch (error) {
          console.log(`   ⚠️  Erro ao remover ${file}: ${error.message}`);
        }
      } else {
        console.log(`   ⏭️  ${file} (não encontrado)`);
        notFoundCount++;
      }
    }

    console.log(`✅ Resumo: ${removedCount} removidos, ${notFoundCount} não encontrados`);
  }

  async cleanupRoutes() {
    console.log('🛠️  Limpando rotas...');

    const routesPath = path.join(this.projectRoot, 'server', 'routes.ts');
    
    if (fs.existsSync(routesPath)) {
      try {
        let routesContent = fs.readFileSync(routesPath, 'utf8');
        const originalContent = routesContent;

        // Remove importação do foundation-setup
        routesContent = routesContent.replace(/const foundationSetup = require\('\.\/routes\/foundation-setup'\);\n?/g, '');
        
        // Remove uso da rota
        routesContent = routesContent.replace(/app\.use\(foundationSetup\);\n\s*/g, '');

        if (routesContent !== originalContent) {
          fs.writeFileSync(routesPath, routesContent);
          console.log('   ✓ server/routes.ts limpo');
        } else {
          console.log('   ⏭️  server/routes.ts não modificado');
        }
      } catch (error) {
        console.log(`   ⚠️  Erro ao limpar rotas: ${error.message}`);
      }
    }

    // Remove diretório de rotas se estiver vazio
    const routesDir = path.join(this.projectRoot, 'server', 'routes');
    if (fs.existsSync(routesDir)) {
      try {
        const files = fs.readdirSync(routesDir);
        if (files.length === 0) {
          fs.rmdirSync(routesDir);
          console.log('   ✓ Diretório server/routes/ removido (vazio)');
        }
      } catch (error) {
        // Ignora erro se não conseguir remover
      }
    }
  }

  async removeMarkers() {
    console.log('📄 Removendo markers de controle...');

    // Remove marker de instalação
    if (fs.existsSync(this.markerPath)) {
      fs.unlinkSync(this.markerPath);
      console.log('   ❌ .foundation-installed');
    }

    // Remove marker de scanner automático
    const scannerFlagPath = path.join(this.projectRoot, '.foundation-scanned');
    if (fs.existsSync(scannerFlagPath)) {
      fs.unlinkSync(scannerFlagPath);
      console.log('   ❌ .foundation-scanned');
    }

    // Remove marker de ignore (opcional)
    if (fs.existsSync(this.ignorePath)) {
      console.log('');
      console.log('🤔 Encontrado arquivo .foundation-ignore');
      console.log('   Este arquivo impede que o foundation pergunte sobre instalação');
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        rl.question('   Remover também? (S/N): ', (answer) => {
          rl.close();
          
          if (answer.toUpperCase().trim() === 'S' || answer.toUpperCase().trim() === 'SIM') {
            fs.unlinkSync(this.ignorePath);
            console.log('   ❌ .foundation-ignore');
          } else {
            console.log('   ⏭️  .foundation-ignore mantido');
          }
          
          resolve();
        });
      });
    }
  }

  showCompletionMessage() {
    console.log('\n🎯 Foundation Removido Completamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Todos os arquivos instalados foram removidos');
    console.log('✅ Rotas foram limpas');
    console.log('✅ Markers de controle removidos');
    console.log('✅ Backup de segurança criado');
    console.log('');
    console.log('🔄 Para reinstalar:');
    console.log('   Execute foundation-detector.cjs novamente');
    console.log('');
    console.log('💾 Backup disponível em:');
    console.log('   foundation/backups/');
    console.log('');
    console.log('🌟 Obrigado por usar o DuEuler Foundation!');
  }
}

// Execução principal
async function main() {
  const remover = new FoundationRemover();
  await remover.remove();
}

// Executa apenas se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = FoundationRemover;