#!/usr/bin/env node

/**
 * Script de configuração automática do replit.md
 * Aplica configurações da foundation em novos sistemas
 */

const fs = require('fs');
const path = require('path');

class ReplitMdSetup {
  constructor() {
    this.templatePath = path.join(__dirname, '../templates/replit.md.template');
    this.outputPath = path.join(process.cwd(), 'replit.md');
    this.configPath = path.join(__dirname, '../configs');
  }

  /**
   * Configura replit.md para um novo projeto
   */
  async setup(projectConfig) {
    console.log('🚀 Configurando replit.md para novo projeto...');

    try {
      // 1. Carregar template
      const template = await this.loadTemplate();
      
      // 2. Aplicar configurações do projeto
      const configured = await this.applyProjectConfig(template, projectConfig);
      
      // 3. Salvar arquivo final
      await this.saveReplitMd(configured);
      
      console.log('✅ replit.md configurado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar replit.md:', error.message);
      return false;
    }
  }

  /**
   * Carrega o template replit.md
   */
  async loadTemplate() {
    if (!fs.existsSync(this.templatePath)) {
      throw new Error('Template replit.md.template não encontrado');
    }

    return fs.readFileSync(this.templatePath, 'utf8');
  }

  /**
   * Aplica configurações específicas do projeto
   */
  async applyProjectConfig(template, config) {
    let configured = template;

    // Substituir placeholders básicos
    const replacements = {
      '{{PROJECT_NAME}}': config.projectName || 'Novo Projeto',
      '{{PROJECT_DESCRIPTION}}': config.projectDescription || 'Sistema desenvolvido com duEuler Foundation',
      '{{PROJECT_OVERVIEW}}': config.projectOverview || this.getDefaultOverview(),
      '{{USER_PREFERENCES}}': config.userPreferences || 'Preferred communication style: Simple, everyday language.',
      '{{PROJECT_START_DATE}}': config.startDate || new Date().toLocaleDateString('pt-BR'),
      '{{CURRENT_DATE}}': new Date().toLocaleDateString('pt-BR'),
      '{{TOTAL_APIS_COUNT}}': this.calculateTotalApis(config.capacity),
      '{{CORE_APIS_COUNT}}': '11',
      '{{RECENT_CHANGES}}': this.generateRecentChanges(config)
    };

    // Aplicar configurações por capacidade
    const capacityConfig = await this.loadCapacityConfig(config.capacity || 'micro');
    Object.assign(replacements, capacityConfig);

    // Substituir todos os placeholders
    for (const [placeholder, value] of Object.entries(replacements)) {
      configured = configured.replace(new RegExp(placeholder, 'g'), value);
    }

    return configured;
  }

  /**
   * Carrega configurações específicas da capacidade
   */
  async loadCapacityConfig(capacity) {
    const configFile = path.join(this.configPath, `${capacity}/config.json`);
    
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      return this.processCapacityConfig(config);
    }

    // Configuração padrão para micro
    return this.getDefaultCapacityConfig();
  }

  /**
   * Processa configurações de capacidade
   */
  processCapacityConfig(config) {
    return {
      '{{LARGE_GAPS_COUNT}}': config.large?.count || '0',
      '{{ENTERPRISE_GAPS_COUNT}}': config.enterprise?.count || '0',
      '{{URGENT_GAPS_COUNT}}': config.urgent?.count || '6',
      '{{MICRO_GAPS_COUNT}}': config.micro?.count || '15',
      '{{SMALL_GAPS_COUNT}}': config.small?.count || '9',
      '{{LARGE_GAPS_LIST}}': this.formatGapsList(config.large?.gaps || []),
      '{{ENTERPRISE_GAPS_LIST}}': this.formatGapsList(config.enterprise?.gaps || []),
      '{{URGENT_GAPS_APIS}}': this.formatApisList(config.urgent?.apis || []),
      '{{MICRO_GAPS_APIS}}': this.formatApisList(config.micro?.apis || []),
      '{{SMALL_GAPS_APIS}}': this.formatApisList(config.small?.apis || []),
      '{{LARGE_GAPS_APIS}}': this.formatApisList(config.large?.apis || []),
      '{{ENTERPRISE_GAPS_APIS}}': this.formatApisList(config.enterprise?.apis || []),
      '{{LARGE_OPERATIONS}}': this.formatOperations(config.large?.operations || []),
      '{{ENTERPRISE_OPERATIONS}}': this.formatOperations(config.enterprise?.operations || [])
    };
  }

  /**
   * Configuração padrão de capacidade
   */
  getDefaultCapacityConfig() {
    return {
      '{{LARGE_GAPS_COUNT}}': '0',
      '{{ENTERPRISE_GAPS_COUNT}}': '0',
      '{{URGENT_GAPS_COUNT}}': '6',
      '{{MICRO_GAPS_COUNT}}': '15',
      '{{SMALL_GAPS_COUNT}}': '9',
      '{{LARGE_GAPS_LIST}}': '(A ser implementado)',
      '{{ENTERPRISE_GAPS_LIST}}': '(A ser implementado)',
      '{{URGENT_GAPS_APIS}}': '- File upload\n- Email service\n- Analytics tracking\n- Error tracking\n- Health checks\n- CDN optimization',
      '{{MICRO_GAPS_APIS}}': '- Redis caching\n- Queue system\n- Search service\n- Push notifications\n- Session management\n- Monitoring',
      '{{SMALL_GAPS_APIS}}': '- Load balancer\n- Auto-scaling\n- WebSocket\n- Advanced security\n- API gateway\n- A/B testing',
      '{{LARGE_GAPS_APIS}}': '(A ser implementado)',
      '{{ENTERPRISE_GAPS_APIS}}': '(A ser implementado)',
      '{{LARGE_OPERATIONS}}': '(A ser implementado)',
      '{{ENTERPRISE_OPERATIONS}}': '(A ser implementado)'
    };
  }

  /**
   * Calcula total de APIs baseado na capacidade
   */
  calculateTotalApis(capacity) {
    const apiCounts = {
      nano: 11,
      micro: 32,
      small: 41,
      large: 49,
      enterprise: 69
    };

    return apiCounts[capacity] || 11;
  }

  /**
   * Formata lista de gaps
   */
  formatGapsList(gaps) {
    if (!gaps.length) return '(A ser implementado)';
    
    return gaps.map((gap, index) => 
      `${index + 1}. **${gap.name}**: ${gap.description}`
    ).join('\n');
  }

  /**
   * Formata lista de APIs
   */
  formatApisList(apis) {
    if (!apis.length) return '(A ser implementado)';
    
    return apis.map(api => `- ${api}`).join('\n');
  }

  /**
   * Formata operações
   */
  formatOperations(operations) {
    if (!operations.length) return '(A ser implementado)';
    
    return operations.map(op => `#### ${op.name}\n${op.description}\n`).join('\n');
  }

  /**
   * Overview padrão
   */
  getDefaultOverview() {
    return `Este projeto foi criado usando a duEuler Foundation, uma base completa para desenvolvimento de aplicações web modernas e escaláveis. O sistema evolui através de diferentes capacidades de usuários, começando do nível NANO e expandindo até ENTERPRISE para suportar 1M+ usuários simultâneos.`;
  }

  /**
   * Gera mudanças recentes
   */
  generateRecentChanges(config) {
    const today = new Date().toLocaleDateString('pt-BR');
    return `- **Foundation Setup**: Sistema criado usando duEuler Foundation v3.0 (${today})
- **Capacidade Inicial**: Configurado para ${config.capacity || 'micro'} capacity
- **APIs Implementadas**: ${this.calculateTotalApis(config.capacity)} endpoints funcionais`;
  }

  /**
   * Salva o arquivo replit.md configurado
   */
  async saveReplitMd(content) {
    // Backup do arquivo existente se houver
    if (fs.existsSync(this.outputPath)) {
      const backupPath = `${this.outputPath}.backup.${Date.now()}`;
      fs.copyFileSync(this.outputPath, backupPath);
      console.log(`📦 Backup criado: ${backupPath}`);
    }

    fs.writeFileSync(this.outputPath, content, 'utf8');
    console.log(`💾 Arquivo salvo: ${this.outputPath}`);
  }

  /**
   * Aplica configurações de um projeto existente
   */
  async applyExistingProject() {
    console.log('🔄 Aplicando configurações de projeto existente...');

    try {
      // Tentar detectar configurações do projeto atual
      const detectedConfig = await this.detectProjectConfig();
      
      // Configurar com base nas detecções
      await this.setup(detectedConfig);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações:', error.message);
      return false;
    }
  }

  /**
   * Detecta configurações do projeto atual
   */
  async detectProjectConfig() {
    const config = {
      projectName: 'duEuler Platform',
      projectDescription: 'Marketplace Digital',
      capacity: 'enterprise',
      userPreferences: 'Preferred communication style: Simple, everyday language.',
      startDate: '24/06/2025'
    };

    // Detectar capacidade baseada em arquivos existentes
    if (fs.existsSync('server/services/kubernetesNative.ts')) {
      config.capacity = 'enterprise';
    } else if (fs.existsSync('server/services/loadBalancer.ts')) {
      config.capacity = 'large';
    } else if (fs.existsSync('server/services/websocketService.ts')) {
      config.capacity = 'small';
    } else if (fs.existsSync('server/services/redisCache.ts')) {
      config.capacity = 'micro';
    }

    // Detectar nome do projeto do package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (pkg.name) {
        config.projectName = pkg.name;
      }
      if (pkg.description) {
        config.projectDescription = pkg.description;
      }
    }

    return config;
  }
}

// Execução do script
async function main() {
  const setup = new ReplitMdSetup();
  
  // Verificar argumentos de linha de comando
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 Script de Configuração replit.md

Uso:
  node setup-replit-md.cjs [opções]

Opções:
  --apply-existing    Aplica configurações do projeto atual
  --capacity <tipo>   Define capacidade (nano|micro|small|large|enterprise)
  --name <nome>       Nome do projeto
  --help, -h          Mostra esta ajuda

Exemplos:
  node setup-replit-md.cjs --apply-existing
  node setup-replit-md.cjs --capacity enterprise --name "Meu Projeto"
`);
    return;
  }

  if (args.includes('--apply-existing')) {
    await setup.applyExistingProject();
  } else {
    // Configuração manual
    const config = {
      projectName: args[args.indexOf('--name') + 1] || 'Novo Projeto',
      capacity: args[args.indexOf('--capacity') + 1] || 'micro'
    };
    
    await setup.setup(config);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ReplitMdSetup;