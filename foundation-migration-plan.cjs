#!/usr/bin/env node

/**
 * PLANO DE MIGRAÇÃO FOUNDATION v3.0
 * Plano detalhado e mapeamentos para reorganização completa
 */

const { FoundationMigrationSystem } = require('./migration-system.cjs');

class FoundationMigrationPlan {
  constructor() {
    this.migrationSystem = new FoundationMigrationSystem();
    
    // Mapeamento de arquivos: fonte → destino
    this.fileMappings = {
      // FRONTEND
      'client/index.html': 'foundation_new/client/index.html',
      'client/src/App.tsx': 'foundation_new/client/src/App.tsx',
      'client/src/main.tsx': 'foundation_new/client/src/main.tsx',
      'client/src/index.css': 'foundation_new/client/src/index.css',
      
      // PAGES
      'client/src/pages/dashboard.tsx': 'foundation_new/client/src/pages/dashboard.tsx',
      'client/src/pages/login.tsx': 'foundation_new/client/src/pages/login.tsx',
      'client/src/pages/setup.tsx': 'foundation_new/client/src/pages/setup.tsx',
      'client/src/pages/not-found.tsx': 'foundation_new/client/src/pages/not-found.tsx',
      'client/src/pages/foundation/capacities.tsx': 'foundation_new/client/src/pages/capacities.tsx',
      'client/src/pages/foundation/dependencies.tsx': 'foundation_new/client/src/pages/dependencies.tsx',
      
      // COMPONENTS
      'client/src/components/dashboard/activity-chart.tsx': 'foundation_new/client/src/components/dashboard/activity-chart.tsx',
      'client/src/components/dashboard/foundation-config.tsx': 'foundation_new/client/src/components/dashboard/foundation-config.tsx',
      'client/src/components/dashboard/foundation-metrics.tsx': 'foundation_new/client/src/components/dashboard/foundation-metrics.tsx',
      'client/src/components/dashboard/header.tsx': 'foundation_new/client/src/components/dashboard/header.tsx',
      'client/src/components/dashboard/metrics-cards.tsx': 'foundation_new/client/src/components/dashboard/metrics-cards.tsx',
      'client/src/components/dashboard/quick-actions.tsx': 'foundation_new/client/src/components/dashboard/quick-actions.tsx',
      'client/src/components/dashboard/recent-activity.tsx': 'foundation_new/client/src/components/dashboard/recent-activity.tsx',
      'client/src/components/dashboard/resource-status.tsx': 'foundation_new/client/src/components/dashboard/resource-status.tsx',
      'client/src/components/dashboard/sidebar.tsx': 'foundation_new/client/src/components/dashboard/sidebar.tsx',
      'client/src/components/dashboard/system-status.tsx': 'foundation_new/client/src/components/dashboard/system-status.tsx',
      'client/src/components/dashboard/user-table.tsx': 'foundation_new/client/src/components/dashboard/user-table.tsx',
      
      // HOOKS E LIBS
      'client/src/hooks/use-auth.tsx': 'foundation_new/client/src/hooks/use-auth.tsx',
      'client/src/hooks/use-metrics.tsx': 'foundation_new/client/src/hooks/use-metrics.tsx',
      'client/src/hooks/use-mobile.tsx': 'foundation_new/client/src/hooks/use-mobile.tsx',
      'client/src/hooks/use-toast.ts': 'foundation_new/client/src/hooks/use-toast.ts',
      'client/src/lib/auth.ts': 'foundation_new/client/src/lib/auth.ts',
      'client/src/lib/queryClient.ts': 'foundation_new/client/src/lib/queryClient.ts',
      'client/src/lib/utils.ts': 'foundation_new/client/src/lib/utils.ts',
      
      // BACKEND
      'server/index.ts': 'foundation_new/server/index.ts',
      'server/routes.ts': 'foundation_new/server/routes.ts',
      'server/storage.ts': 'foundation_new/server/storage.ts',
      'server/db.ts': 'foundation_new/server/db.ts',
      'server/vite.ts': 'foundation_new/server/vite.ts',
      'server/monitoring.ts': 'foundation_new/server/monitoring.ts',
      'server/foundation-config.ts': 'foundation_new/server/foundation-config.ts',
      'server/foundation-integrator.ts': 'foundation_new/server/foundation-integrator.ts',
      
      // SHARED
      'shared/schema.ts': 'foundation_new/shared/schema.ts',
      
      // CONFIGURAÇÕES
      'package.json': 'foundation_new/package.json',
      'package-lock.json': 'foundation_new/package-lock.json',
      'tsconfig.json': 'foundation_new/tsconfig.json',
      'vite.config.ts': 'foundation_new/vite.config.ts',
      'tailwind.config.ts': 'foundation_new/tailwind.config.ts',
      'postcss.config.js': 'foundation_new/postcss.config.js',
      'drizzle.config.ts': 'foundation_new/drizzle.config.ts',
      'components.json': 'foundation_new/components.json',
      'foundation-config.json': 'foundation_new/foundation-config.json'
    };

    // Mapeamento de imports a serem atualizados
    this.importMappings = {
      // Imports relativos para absolute paths
      '@/components/': '@/components/',
      '@/hooks/': '@/hooks/',
      '@/lib/': '@/lib/',
      '@/pages/': '@/pages/',
      '@shared/': '@shared/',
      
      // Imports específicos que mudam
      '@/pages/foundation/capacities': '@/pages/capacities',
      '@/pages/foundation/dependencies': '@/pages/dependencies',
      'server/foundation-config': 'server/foundation-config',
      'server/foundation-integrator': 'server/foundation-integrator'
    };

    // Mapeamento de rotas
    this.routeMappings = {
      '/': '/foundation/',
      '/dashboard': '/foundation/',
      '/login': '/foundation/login',
      '/setup': '/foundation/setup',
      '/foundation/capacities': '/foundation/capacities',
      '/foundation/dependencies': '/foundation/dependencies'
    };

    // Arquivos que precisam de UI components copiados
    this.uiComponentsNeeded = [
      'client/src/components/ui',
      'client/src/components/layout'
    ];
  }

  // Copiar componentes UI necessários
  async copyUIComponents() {
    try {
      const { execSync } = require('child_process');
      
      // Copiar toda a pasta ui
      execSync('cp -r client/src/components/ui foundation_new/client/src/components/', { stdio: 'inherit' });
      execSync('cp -r client/src/components/layout foundation_new/client/src/components/', { stdio: 'inherit' });
      
      this.migrationSystem.log('COPY_UI_COMPONENTS', {
        description: 'Componentes UI copiados para Foundation',
        components: ['ui', 'layout']
      });
      
      return true;
    } catch (error) {
      this.migrationSystem.logError('COPY_UI_COMPONENTS', error);
      return false;
    }
  }

  // Executar migração completa
  async executeMigration() {
    console.log('🚀 INICIANDO MIGRAÇÃO FOUNDATION v3.0');
    console.log('📋 Backup já criado: backup/fundation_ponto1.tar.gz');
    
    try {
      // 1. Criar estrutura
      if (!this.migrationSystem.createFoundationStructure()) {
        throw new Error('Falha ao criar estrutura de diretórios');
      }

      // 2. Copiar componentes UI
      if (!await this.copyUIComponents()) {
        throw new Error('Falha ao copiar componentes UI');
      }

      // 3. Mover arquivos principais
      let successCount = 0;
      let totalFiles = Object.keys(this.fileMappings).length;

      for (const [source, destination] of Object.entries(this.fileMappings)) {
        if (this.migrationSystem.moveFile(source, destination)) {
          successCount++;
        }
      }

      console.log(`📁 Arquivos movidos: ${successCount}/${totalFiles}`);

      // 4. Atualizar imports nos arquivos movidos
      const filesToUpdate = Object.values(this.fileMappings).filter(f => 
        f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')
      );

      for (const file of filesToUpdate) {
        this.migrationSystem.updateImports(file, this.importMappings);
      }

      // 5. Atualizar rotas
      const routeFiles = [
        'foundation_new/client/src/App.tsx',
        'foundation_new/client/src/components/dashboard/sidebar.tsx',
        'foundation_new/server/routes.ts'
      ];

      for (const file of routeFiles) {
        this.migrationSystem.updateRoutes(file, this.routeMappings);
      }

      // 6. Validar migração
      if (!this.migrationSystem.validateMigration()) {
        throw new Error('Validação de integridade falhou');
      }

      // 7. Finalizar
      this.migrationSystem.finalizeMigration(true);
      return true;

    } catch (error) {
      console.error('💥 ERRO NA MIGRAÇÃO:', error.message);
      this.migrationSystem.logError('MIGRATION_FAILED', error);
      this.migrationSystem.finalizeMigration(false);
      return false;
    }
  }

  // Mostrar resumo do plano
  showPlan() {
    console.log('\n📋 PLANO DE MIGRAÇÃO FOUNDATION v3.0\n');
    
    console.log(`📁 Arquivos a mover: ${Object.keys(this.fileMappings).length}`);
    console.log(`🔗 Imports a atualizar: ${Object.keys(this.importMappings).length}`);
    console.log(`🛣️  Rotas a atualizar: ${Object.keys(this.routeMappings).length}`);
    
    console.log('\n📂 ESTRUTURA FINAL:');
    console.log('foundation_new/');
    console.log('├── client/');
    console.log('│   ├── src/');
    console.log('│   │   ├── components/');
    console.log('│   │   ├── hooks/');
    console.log('│   │   ├── lib/');
    console.log('│   │   ├── pages/');
    console.log('│   │   └── ...');
    console.log('├── server/');
    console.log('├── shared/');
    console.log('└── config/');
    
    console.log('\n🛣️  ROTAS FINAIS:');
    for (const [old, newRoute] of Object.entries(this.routeMappings)) {
      console.log(`  ${old} → ${newRoute}`);
    }
  }
}

module.exports = { FoundationMigrationPlan };

// Executar se chamado diretamente
if (require.main === module) {
  const plan = new FoundationMigrationPlan();
  plan.showPlan();
}