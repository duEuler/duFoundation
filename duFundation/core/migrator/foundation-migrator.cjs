/**
 * Foundation Migrator v3.0 - Migração Automática de Projetos
 * 
 * Este módulo implementa a Fase 2 da arquitetura:
 * - Migração automática quando possível
 * - Guia de migração manual quando necessário  
 * - Bloqueio total para incompatibilidades críticas
 * 
 * BASEADO NOS PROBLEMAS IDENTIFICADOS:
 * 1. Incompatibilidade ES Modules vs CommonJS
 * 2. Estrutura de servidor inadequada
 * 3. Dependências faltando
 */

const fs = require('fs');
const path = require('path');
const { scanProject } = require('./foundation-scanner.cjs');

class FoundationProjectMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.foundationDir = path.join(this.projectRoot, 'foundation');
    this.backupDir = path.join(this.foundationDir, '.migration-backup');
    this.results = {
      migrationsApplied: [],
      manualActions: [],
      errors: [],
      success: false
    };
  }

  /**
   * MIGRADOR PRINCIPAL
   */
  async migrateProject() {
    console.log('🔧 Foundation Migrator v3.0 - Migração Automática');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Primeiro executar scan para obter estado atual
    console.log('🔍 Analisando projeto atual...');
    const scanResults = await scanProject();
    
    if (scanResults.classification === 'COMPATÍVEL') {
      console.log('✅ Projeto já está compatível com Foundation');
      this.results.success = true;
      return this.results;
    }

    if (scanResults.classification === 'INCOMPATÍVEL') {
      console.log('❌ Projeto tem incompatibilidades críticas que requerem ação manual');
      this.addManualAction('Resolver problemas críticos identificados no scan');
      this.addManualAction('Consultar TROUBLESHOOTING.md para orientações específicas');
      return this.results;
    }

    // Criar backup antes de iniciar
    await this.createBackup();

    // Aplicar migrações automáticas
    await this.migrateToESModules(scanResults);
    await this.ensureProjectStructure(scanResults);
    await this.fixServerConfiguration(scanResults);
    await this.installMissingDependencies(scanResults);
    await this.generateMissingFiles(scanResults);

    // Verificar resultado final
    console.log('\n🧪 Verificando resultado das migrações...');
    const finalScan = await scanProject();
    
    this.results.success = finalScan.classification !== 'INCOMPATÍVEL';
    
    if (this.results.success) {
      console.log('✅ Migração concluída com sucesso!');
      console.log('🚀 Projeto agora está pronto para Foundation');
    } else {
      console.log('⚠️ Migração parcialmente concluída - ações manuais necessárias');
    }

    return this.results;
  }

  /**
   * MIGRAÇÃO PARA ES MODULES
   */
  async migrateToESModules(scanResults) {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.addError('package.json não encontrado');
      return;
    }

    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Adicionar type: "module" se não existir
      if (!packageData.type || packageData.type !== 'module') {
        packageData.type = 'module';
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        this.addMigration('Adicionado "type": "module" ao package.json');
      }

      // Converter arquivos CommonJS para ES modules
      await this.convertCommonJSFiles(scanResults);

    } catch (error) {
      this.addError(`Erro ao migrar package.json: ${error.message}`);
    }
  }

  /**
   * CONVERTER ARQUIVOS COMMONJS PARA ES MODULES
   */
  async convertCommonJSFiles(scanResults) {
    const filesToConvert = [
      'server/index.js',
      'server/index.ts',
      'server/routes.js', 
      'server/routes.ts'
    ];

    for (const file of filesToConvert) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        await this.convertFileToESModules(filePath);
      }
    }
  }

  /**
   * CONVERTER ARQUIVO INDIVIDUAL
   */
  async convertFileToESModules(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Converter require() para import
      const requireRegex = /const\s+(\{[^}]+\}|\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g;
      content = content.replace(requireRegex, (match, varName, moduleName) => {
        modified = true;
        if (varName.startsWith('{')) {
          return `import ${varName} from '${moduleName}';`;
        } else {
          return `import ${varName} from '${moduleName}';`;
        }
      });

      // Converter module.exports para export
      content = content.replace(/module\.exports\s*=\s*{([^}]+)}/g, (match, exports) => {
        modified = true;
        return `export { ${exports.replace(/:/g, ',')} };`;
      });

      content = content.replace(/module\.exports\s*=\s*(\w+)/g, (match, exportName) => {
        modified = true;
        return `export default ${exportName};`;
      });

      // Converter exports.funcName para export function
      content = content.replace(/exports\.(\w+)\s*=\s*function/g, (match, funcName) => {
        modified = true;
        return `export function ${funcName}`;
      });

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.addMigration(`Convertido ${filePath} para ES modules`);
      }

    } catch (error) {
      this.addError(`Erro ao converter ${filePath}: ${error.message}`);
    }
  }

  /**
   * GARANTIR ESTRUTURA DO PROJETO
   */
  async ensureProjectStructure(scanResults) {
    const requiredDirs = ['server', 'client', 'shared'];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.addMigration(`Criado diretório ${dir}/`);
      }
    }
  }

  /**
   * CORRIGIR CONFIGURAÇÃO DO SERVIDOR
   */
  async fixServerConfiguration(scanResults) {
    const serverIndexPath = path.join(this.projectRoot, 'server/index.ts');
    const serverIndexJSPath = path.join(this.projectRoot, 'server/index.js');
    
    // Priorizar TypeScript
    const serverPath = fs.existsSync(serverIndexPath) ? serverIndexPath : serverIndexJSPath;

    if (!fs.existsSync(serverPath)) {
      // Criar server/index.ts básico
      const serverTemplate = this.generateServerIndexTemplate();
      fs.writeFileSync(serverIndexPath, serverTemplate);
      this.addMigration('Criado server/index.ts básico');
    }

    // Verificar se tem função registerRoutes
    const routesPath = path.join(this.projectRoot, 'server/routes.ts');
    const routesJSPath = path.join(this.projectRoot, 'server/routes.js');
    
    const routesFile = fs.existsSync(routesPath) ? routesPath : routesJSPath;
    
    if (!fs.existsSync(routesFile)) {
      const routesTemplate = this.generateRoutesTemplate();
      fs.writeFileSync(routesPath, routesTemplate);
      this.addMigration('Criado server/routes.ts básico');
    }
  }

  /**
   * INSTALAR DEPENDÊNCIAS FALTANDO
   */
  async installMissingDependencies(scanResults) {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packagePath)) return;

    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = {
        ...packageData.dependencies || {},
        ...packageData.devDependencies || {}
      };

      const requiredDeps = {
        'express': '^4.18.0',
        'typescript': '^5.0.0'
      };

      const depsToAdd = {};
      for (const [dep, version] of Object.entries(requiredDeps)) {
        if (!allDeps[dep]) {
          depsToAdd[dep] = version;
        }
      }

      if (Object.keys(depsToAdd).length > 0) {
        if (!packageData.dependencies) packageData.dependencies = {};
        Object.assign(packageData.dependencies, depsToAdd);
        
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        this.addMigration(`Adicionadas dependências: ${Object.keys(depsToAdd).join(', ')}`);
        this.addManualAction('Executar "npm install" para instalar novas dependências');
      }

    } catch (error) {
      this.addError(`Erro ao instalar dependências: ${error.message}`);
    }
  }

  /**
   * GERAR ARQUIVOS FALTANDO
   */
  async generateMissingFiles(scanResults) {
    // Gerar tsconfig.json se não existir
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      const tsconfigTemplate = this.generateTsconfigTemplate();
      fs.writeFileSync(tsconfigPath, tsconfigTemplate);
      this.addMigration('Criado tsconfig.json');
    }

    // Gerar shared/schema.ts básico se não existir
    const schemaPath = path.join(this.projectRoot, 'shared/schema.ts');
    if (!fs.existsSync(schemaPath)) {
      const schemaTemplate = this.generateSchemaTemplate();
      fs.writeFileSync(schemaPath, schemaTemplate);
      this.addMigration('Criado shared/schema.ts básico');
    }
  }

  /**
   * TEMPLATES DE ARQUIVOS
   */
  generateServerIndexTemplate() {
    return `import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Register routes
const server = await registerRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  }

  generateRoutesTemplate() {
    return `import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
`;
  }

  generateTsconfigTemplate() {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client", "server", "shared"],
  "exclude": ["node_modules", "dist"]
}
`;
  }

  generateSchemaTemplate() {
    return `// Basic schema template for Foundation
// Add your database schemas here when needed

export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Example: User schema
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: string;
}
`;
  }

  /**
   * CRIAR BACKUP
   */
  async createBackup() {
    try {
      if (!fs.existsSync(this.foundationDir)) {
        fs.mkdirSync(this.foundationDir, { recursive: true });
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const filesToBackup = [
        'package.json',
        'server/index.ts',
        'server/index.js',
        'server/routes.ts', 
        'server/routes.js',
        'tsconfig.json'
      ];

      for (const file of filesToBackup) {
        const sourcePath = path.join(this.projectRoot, file);
        if (fs.existsSync(sourcePath)) {
          const backupPath = path.join(this.backupDir, file.replace('/', '_'));
          fs.copyFileSync(sourcePath, backupPath);
        }
      }

      this.addMigration(`Backup criado em ${this.backupDir}`);

    } catch (error) {
      this.addError(`Erro ao criar backup: ${error.message}`);
    }
  }

  /**
   * UTILITÁRIOS
   */
  addMigration(message) {
    this.results.migrationsApplied.push(message);
    console.log(`✅ ${message}`);
  }

  addManualAction(action) {
    this.results.manualActions.push(action);
    console.log(`📝 Ação manual: ${action}`);
  }

  addError(error) {
    this.results.errors.push(error);
    console.log(`❌ Erro: ${error}`);
  }

  /**
   * GERAR RELATÓRIO
   */
  generateReport() {
    console.log('\n📊 RELATÓRIO DE MIGRAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.results.migrationsApplied.length > 0) {
      console.log('\n✅ MIGRAÇÕES APLICADAS:');
      this.results.migrationsApplied.forEach(migration => {
        console.log(`   • ${migration}`);
      });
    }

    if (this.results.manualActions.length > 0) {
      console.log('\n📝 AÇÕES MANUAIS NECESSÁRIAS:');
      this.results.manualActions.forEach(action => {
        console.log(`   • ${action}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }

    console.log(`\n🎯 Status: ${this.results.success ? 'SUCESSO' : 'REQUER AÇÕES MANUAIS'}`);
    
    if (this.results.success) {
      console.log('🚀 Próximo passo: foundation-installer');
    } else {
      console.log('📖 Consulte MIGRATION-GUIDE.md para orientações detalhadas');
    }

    return this.results;
  }
}

/**
 * FUNÇÃO PRINCIPAL EXPORTADA
 */
async function migrateProject() {
  const migrator = new FoundationProjectMigrator();
  const results = await migrator.migrateProject();
  migrator.generateReport();
  
  // Salvar relatório de migração
  const reportPath = path.join(migrator.foundationDir, 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
  
  return results;
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateProject().catch(console.error);
}

module.exports = { FoundationProjectMigrator, migrateProject };