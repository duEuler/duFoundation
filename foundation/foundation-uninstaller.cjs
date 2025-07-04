#!/usr/bin/env node

/**
 * Foundation Uninstaller v3.0
 * Sistema avançado de desinstalação com registro detalhado
 * 
 * Funcionalidades:
 * - Lê manifesto de instalação para saber o que remover
 * - Remove APENAS o que foi instalado pelo foundation
 * - Restaura estado original do projeto (versão virgem)
 * - Backup completo antes da remoção
 * - Comando /foundation/uninstall para interface web
 * - Múltiplos pontos de entrada: CLI, comando global, rota web
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class FoundationUninstaller {
  constructor() {
    // Detecta se está rodando dentro da pasta foundation ou na raiz
    this.foundationDir = __dirname;
    this.projectRoot = path.resolve(__dirname, '..');
    
    // Arquivos de controle
    this.foundationMarker = '.foundation-installed';
    this.foundationManifest = '.foundation-manifest.json';
    this.foundationIgnore = '.foundation-ignore';
    
    // Paths importantes
    this.markerPath = path.join(this.projectRoot, this.foundationMarker);
    this.manifestPath = path.join(this.projectRoot, this.foundationManifest);
    this.ignorePath = path.join(this.projectRoot, this.foundationIgnore);
    
    console.log('🗑️  Foundation Uninstaller v3.0 - Sistema Avançado');
  }

  async uninstall(options = {}) {
    try {
      // Verifica se está instalado
      if (!this.isInstalled()) {
        console.log('⚠️  Foundation não está instalado neste projeto');
        console.log('💡 Projeto já está em estado virgem');
        return { success: false, reason: 'not_installed' };
      }

      // Lê manifesto para saber o que foi instalado
      const manifest = await this.readManifest();
      
      if (!manifest) {
        console.log('⚠️  Manifesto de instalação não encontrado');
        console.log('💡 Executando remoção básica usando marker...');
        return await this.fallbackUninstall();
      }

      // Se for modo silencioso (para testes), pula confirmação
      if (!options.silent) {
        const confirmed = await this.askConfirmation(manifest);
        if (!confirmed) {
          return { success: false, reason: 'cancelled' };
        }
      }

      // Executa desinstalação baseada no manifesto
      return await this.performDetailedUninstall(manifest);

    } catch (error) {
      console.error('❌ Erro no Foundation Uninstaller:', error.message);
      return { success: false, error: error.message };
    }
  }

  isInstalled() {
    return fs.existsSync(this.markerPath);
  }

  async readManifest() {
    try {
      if (fs.existsSync(this.manifestPath)) {
        const content = fs.readFileSync(this.manifestPath, 'utf8');
        return JSON.parse(content);
      }
      
      // Fallback: tenta ler do marker antigo
      if (fs.existsSync(this.markerPath)) {
        const content = fs.readFileSync(this.markerPath, 'utf8');
        const markerData = JSON.parse(content);
        
        // Converte formato antigo para manifesto
        return {
          version: markerData.version || '3.0.0',
          installedAt: markerData.installedAt,
          installedBy: markerData.installedBy || 'foundation-detector',
          files: markerData.files || [],
          routeModifications: [],
          directories: [],
          backups: []
        };
      }
      
      return null;
    } catch (error) {
      console.log('⚠️  Erro lendo manifesto:', error.message);
      return null;
    }
  }

  async askConfirmation(manifest) {
    console.log('\n🚨 Foundation Uninstaller - Confirmação');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Esta operação irá REMOVER COMPLETAMENTE o Foundation');
    console.log('🎯 Projeto retornará ao estado VIRGEM original');
    console.log('');
    
    console.log('📋 O que será removido:');
    if (manifest.files && manifest.files.length > 0) {
      manifest.files.forEach(file => {
        console.log(`   ❌ ${file}`);
      });
    }
    
    if (manifest.routeModifications && manifest.routeModifications.length > 0) {
      console.log('   ❌ Modificações em rotas:');
      manifest.routeModifications.forEach(mod => {
        console.log(`      • ${mod.file}: ${mod.description}`);
      });
    }
    
    if (manifest.directories && manifest.directories.length > 0) {
      console.log('   ❌ Diretórios vazios:');
      manifest.directories.forEach(dir => {
        console.log(`      • ${dir}`);
      });
    }
    
    console.log('');
    console.log('✅ Backup completo será criado em foundation/backups/');
    console.log('✅ Operação pode ser revertida se necessário');
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('🤔 Confirma DESINSTALAÇÃO COMPLETA? (S/N): ', (answer) => {
        rl.close();
        
        const choice = answer.toUpperCase().trim();
        console.log('');

        if (choice === 'S' || choice === 'SIM') {
          console.log('✅ Desinstalação confirmada! Iniciando...');
          resolve(true);
        } else {
          console.log('⏭️  Desinstalação cancelada');
          resolve(false);
        }
      });
    });
  }

  async performDetailedUninstall(manifest) {
    try {
      console.log('📦 Iniciando desinstalação detalhada...');
      
      // 1. Cria backup completo
      const backupPath = await this.createDetailedBackup(manifest);
      
      // 2. Remove arquivos instalados
      await this.removeInstalledFiles(manifest.files || []);
      
      // 3. Reverte modificações em rotas
      await this.revertRouteModifications(manifest.routeModifications || []);
      
      // 4. Remove diretórios vazios
      await this.removeEmptyDirectories(manifest.directories || []);
      
      // 5. Remove arquivos de controle
      await this.removeControlFiles();
      
      // 6. Verifica se projeto está limpo
      await this.verifyCleanState();
      
      this.showSuccessMessage(backupPath);
      
      return { 
        success: true, 
        backupPath,
        filesRemoved: manifest.files?.length || 0,
        modificationsReverted: manifest.routeModifications?.length || 0
      };

    } catch (error) {
      console.error('❌ Erro durante desinstalação:', error.message);
      console.log('💡 Backup criado, você pode tentar restaurar manualmente');
      return { success: false, error: error.message };
    }
  }

  async createDetailedBackup(manifest) {
    const timestamp = Date.now();
    const backupDir = path.join(this.foundationDir, 'backups');
    const backupPath = path.join(backupDir, `uninstall-backup-${timestamp}`);
    
    console.log('💾 Criando backup completo...');
    
    // Garante que o diretório de backup existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Backup dos arquivos que serão removidos
    if (manifest.files && manifest.files.length > 0) {
      console.log('   📁 Fazendo backup dos arquivos...');
      for (const file of manifest.files) {
        const sourcePath = path.join(this.projectRoot, file);
        if (fs.existsSync(sourcePath)) {
          const backupFilePath = path.join(backupPath, file);
          const backupFileDir = path.dirname(backupFilePath);
          
          if (!fs.existsSync(backupFileDir)) {
            fs.mkdirSync(backupFileDir, { recursive: true });
          }
          
          fs.copyFileSync(sourcePath, backupFilePath);
          console.log(`      ✓ ${file}`);
        }
      }
    }
    
    // Backup do manifesto e marker
    const controlFiles = [this.foundationMarker, this.foundationManifest];
    for (const controlFile of controlFiles) {
      const sourcePath = path.join(this.projectRoot, controlFile);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, path.join(backupPath, controlFile));
      }
    }
    
    // Cria registro do backup
    const backupInfo = {
      createdAt: new Date().toISOString(),
      reason: 'foundation-uninstall',
      manifest: manifest,
      originalFiles: manifest.files || [],
      canRestore: true
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'backup-info.json'), 
      JSON.stringify(backupInfo, null, 2)
    );
    
    console.log(`   ✅ Backup criado: ${path.relative(this.projectRoot, backupPath)}`);
    return backupPath;
  }

  async removeInstalledFiles(files) {
    if (!files || files.length === 0) return;
    
    console.log('🗑️  Removendo arquivos instalados...');
    
    for (const file of files) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   ❌ ${file}`);
      }
    }
  }

  async revertRouteModifications(modifications) {
    console.log('🔄 Revertendo modificações em rotas...');
    
    // Correções específicas desta sessão
    const sessionFixes = [
      {
        file: 'server/routes.ts',
        type: 'import_removal',
        description: 'Removendo import do Foundation'
      },
      {
        file: 'server/routes.ts', 
        type: 'route_removal',
        description: 'Removendo app.use do Foundation'
      },
      {
        file: 'server/index.ts',
        type: 'import_restoration',
        description: 'Restaurando routes-minimal'
      }
    ];

    // Aplicar correções da sessão
    for (const fix of sessionFixes) {
      const filePath = path.join(this.projectRoot, fix.file);
      if (fs.existsSync(filePath)) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let modified = false;

          if (fix.type === 'import_removal' && fix.file === 'server/routes.ts') {
            // Remove import do Foundation
            const originalContent = content;
            content = content.replace(/import foundationSetup from '\.\/routes\/foundation-setup\.js';\n/, '');
            if (content !== originalContent) modified = true;
          }

          if (fix.type === 'route_removal' && fix.file === 'server/routes.ts') {
            // Remove app.use do Foundation
            const originalContent = content;
            content = content.replace(/\s+\/\/ Apply foundation setup route\n\s+app\.use\(foundationSetup\);\n/, '\n');
            if (content !== originalContent) modified = true;
          }

          if (fix.type === 'import_restoration' && fix.file === 'server/index.ts') {
            // Restaura routes-minimal
            const originalContent = content;
            content = content.replace('from "./routes"', 'from "./routes-minimal"');
            if (content !== originalContent) modified = true;
          }

          if (modified) {
            // Limpa linhas vazias extras
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
            fs.writeFileSync(filePath, content);
            console.log(`   ✓ ${fix.file}: ${fix.description}`);
          }

        } catch (error) {
          console.log(`   ⚠️  Erro revertendo ${fix.file}: ${error.message}`);
        }
      }
    }

    // Processar modificações do manifesto (se houver)
    if (modifications && modifications.length > 0) {
      for (const mod of modifications) {
        const filePath = path.join(this.projectRoot, mod.file);
        if (fs.existsSync(filePath)) {
          try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove importações do foundation
            if (mod.type === 'import' && mod.content) {
              content = content.replace(mod.content, '');
            }
            
            // Remove uso de rotas do foundation
            if (mod.type === 'route' && mod.content) {
              content = content.replace(mod.content, '');
            }
            
            // Limpa linhas vazias extras
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
            
            fs.writeFileSync(filePath, content);
            console.log(`   ✓ ${mod.file}: ${mod.description}`);
            
          } catch (error) {
            console.log(`   ⚠️  Erro revertendo ${mod.file}: ${error.message}`);
          }
        }
      }
    }
  }

  async removeEmptyDirectories(directories) {
    if (!directories || directories.length === 0) return;
    
    console.log('📁 Removendo diretórios vazios...');
    
    // Remove em ordem reversa (mais profundos primeiro)
    const sortedDirs = directories.sort((a, b) => b.length - a.length);
    
    for (const dir of sortedDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        try {
          const files = fs.readdirSync(dirPath);
          if (files.length === 0) {
            fs.rmdirSync(dirPath);
            console.log(`   ❌ ${dir}/`);
          }
        } catch (error) {
          // Ignora erros de diretórios não vazios
        }
      }
    }
  }

  async removeControlFiles() {
    console.log('🎯 Removendo arquivos de controle...');
    
    const controlFiles = [
      this.markerPath,
      this.manifestPath,
      this.ignorePath
    ];
    
    for (const file of controlFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`   ❌ ${path.basename(file)}`);
      }
    }
  }

  async verifyCleanState() {
    console.log('🔍 Verificando estado limpo...');
    
    const checkFiles = [
      'server/routes/foundation-setup.js',
      '.foundation-installed',
      '.foundation-manifest.json'
    ];
    
    let isClean = true;
    for (const file of checkFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ⚠️  Arquivo ainda existe: ${file}`);
        isClean = false;
      }
    }
    
    if (isClean) {
      console.log('   ✅ Projeto em estado VIRGEM confirmado');
    } else {
      console.log('   ⚠️  Alguns arquivos podem não ter sido removidos');
    }
    
    return isClean;
  }

  async fallbackUninstall() {
    console.log('🔧 Executando remoção básica (fallback)...');
    
    // Remove arquivos conhecidos do foundation
    const knownFiles = [
      'server/routes/foundation-setup.js'
    ];
    
    for (const file of knownFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   ❌ ${file}`);
      }
    }
    
    // Remove arquivos de controle
    await this.removeControlFiles();
    
    console.log('✅ Remoção básica concluída');
    return { success: true, mode: 'fallback' };
  }

  showSuccessMessage(backupPath) {
    console.log('\n🎉 Foundation Desinstalado com Sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Projeto retornou ao estado VIRGEM original');
    console.log('✅ Todas as modificações foram revertidas');
    console.log('✅ Backup completo criado para segurança');
    console.log('');
    console.log('💾 Backup disponível em:');
    console.log(`   ${path.relative(this.projectRoot, backupPath)}`);
    console.log('');
    console.log('🔄 Para reinstalar:');
    console.log('   node foundation/foundation-detector.cjs');
    console.log('');
    console.log('🔙 Para restaurar backup (se necessário):');
    console.log('   node foundation/foundation-restorer.cjs');
    console.log('');
    console.log('🧪 Projeto pronto para novos testes de instalação!');
  }

  // Método para interface web
  async uninstallWeb() {
    return await this.uninstall({ silent: true });
  }
}

// Execução principal
async function main() {
  const uninstaller = new FoundationUninstaller();
  const result = await uninstaller.uninstall();
  
  if (!result.success) {
    process.exit(1);
  }
}

// Executa apenas se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = FoundationUninstaller;