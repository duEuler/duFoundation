#!/usr/bin/env node

/**
 * duEuler Foundation - Complete Project Setup
 * Master script that configures all project templates and dependencies
 * Version: 3.0
 * Official Repository: https://github.com/duEuler/duEulerWebSite
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FoundationSetup {
  constructor() {
    this.projectRoot = process.cwd();
    // Detect if we're running from within dueuler-foundation directory
    if (this.projectRoot.endsWith('dueuler-foundation')) {
      this.foundationPath = this.projectRoot;
      this.projectRoot = path.dirname(this.projectRoot);
    } else {
      this.foundationPath = path.join(this.projectRoot, 'dueuler-foundation');
    }
    this.templatesPath = path.join(this.foundationPath, 'templates');
    this.automationPath = path.join(this.foundationPath, 'automation');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '🔧',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'setup': '🚀'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  parseArguments() {
    const args = process.argv.slice(2);
    const config = {
      capacity: 'micro',
      projectName: 'dueuler-project',
      description: 'Project built with duEuler Foundation',
      skipDependencies: false,
      verbose: false
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--capacity':
          config.capacity = args[++i];
          break;
        case '--name':
          config.projectName = args[++i];
          break;
        case '--description':
          config.description = args[++i];
          break;
        case '--skip-deps':
          config.skipDependencies = true;
          break;
        case '--verbose':
          config.verbose = true;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
      }
    }

    return config;
  }

  showHelp() {
    console.log(`
duEuler Foundation Setup v3.0

Usage: node foundation-setup.cjs [options]

Options:
  --capacity <tier>     Project capacity (nano, micro, small, large, enterprise)
  --name <name>         Project name
  --description <desc>  Project description  
  --skip-deps          Skip dependency installation
  --verbose            Verbose output
  --help               Show this help

Examples:
  node foundation-setup.cjs --capacity enterprise --name "MyApp"
  node foundation-setup.cjs --capacity micro --skip-deps
    `);
  }

  applyTemplate(templateFile, targetFile, replacements = {}) {
    const templatePath = path.join(this.templatesPath, templateFile);
    
    if (!fs.existsSync(templatePath)) {
      this.log(`Template not found: ${templateFile}`, 'warning');
      return false;
    }

    try {
      let content = fs.readFileSync(templatePath, 'utf8');
      
      // Apply replacements
      for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        content = content.replace(regex, value);
      }

      // Write to target
      const targetPath = path.join(this.projectRoot, targetFile);
      fs.writeFileSync(targetPath, content, 'utf8');
      
      this.log(`Applied template: ${templateFile} → ${targetFile}`);
      return true;
    } catch (error) {
      this.log(`Error applying template ${templateFile}: ${error.message}`, 'error');
      return false;
    }
  }

  setupPackageJson(config) {
    this.log('Setting up package.json...');
    
    const templateFile = this.getPackageTemplate(config.capacity);
    const replacements = {
      PROJECT_NAME: config.projectName,
      PROJECT_DESCRIPTION: config.description,
      CAPACITY: config.capacity,
      INIT_DATE: new Date().toISOString()
    };

    return this.applyTemplate(templateFile, 'package.json', replacements);
  }

  setupConfigFiles(config) {
    this.log('Setting up configuration files...');
    
    const configFiles = [
      ['tsconfig.json.template', 'tsconfig.json'],
      ['vite.config.ts.template', 'vite.config.ts'],
      ['tailwind.config.ts.template', 'tailwind.config.ts'],
      ['components.json.template', 'components.json'],
      ['drizzle.config.ts.template', 'drizzle.config.ts'],
      ['postcss.config.js.template', 'postcss.config.js'],
      ['vitest.config.ts.template', 'vitest.config.ts'],
      ['i18next-parser.config.js.template', 'i18next-parser.config.js'],
      [this.getDockerComposeTemplate(config.capacity), 'docker-compose.yml'],
      ['.env.template', '.env.example']
    ];

    const replacements = {
      PROJECT_NAME: config.projectName,
      PROJECT_DESCRIPTION: config.description
    };

    let success = true;
    for (const [template, target] of configFiles) {
      if (!this.applyTemplate(template, target, replacements)) {
        success = false;
      }
    }

    return success;
  }

  setupReplitMd(config) {
    this.log('Setting up replit.md...');
    
    const setupScript = path.join(this.automationPath, 'setup-replit-md.cjs');
    
    if (!fs.existsSync(setupScript)) {
      this.log('replit.md setup script not found', 'warning');
      return false;
    }

    try {
      execSync(`node ${setupScript} --capacity ${config.capacity} --name "${config.projectName}"`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        cwd: this.projectRoot
      });
      
      this.log('replit.md configured successfully');
      return true;
    } catch (error) {
      this.log(`Error setting up replit.md: ${error.message}`, 'error');
      return false;
    }
  }

  installDependencies(config) {
    if (config.skipDependencies) {
      this.log('Skipping dependency installation');
      return true;
    }

    this.log('Installing dependencies...');
    
    const installScript = path.join(this.automationPath, 'install-dependencies.cjs');
    
    if (!fs.existsSync(installScript)) {
      this.log('Dependency installer not found', 'warning');
      return false;
    }

    try {
      execSync(`node ${installScript} --capacity ${config.capacity}`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        cwd: this.projectRoot
      });
      
      this.log('Dependencies installed successfully');
      return true;
    } catch (error) {
      this.log(`Error installing dependencies: ${error.message}`, 'error');
      return false;
    }
  }

  getPackageTemplate(capacity) {
    const templates = {
      'nano': 'package.json.template',
      'micro': 'package.json.micro.template',
      'small': 'package.json.small.template',
      'large': 'package.json.large.template',
      'enterprise': 'package.json.enterprise.template'
    };

    return templates[capacity] || templates['micro'];
  }

  getDockerComposeTemplate(capacity) {
    const templates = {
      'nano': 'docker-compose.yml.nano.template',
      'micro': 'docker-compose.yml.micro.template',
      'small': 'docker-compose.yml.small.template',
      'large': 'docker-compose.yml.large.template',
      'enterprise': 'docker-compose.yml.enterprise.template'
    };

    return templates[capacity] || 'docker-compose.yml.template';
  }

  createDirectoryStructure() {
    this.log('Creating directory structure...');
    
    const directories = [
      'client/src/components',
      'client/src/pages',
      'client/src/lib',
      'client/src/hooks',
      'server/middleware',
      'server/services',
      'server/routes',
      'shared',
      'config',
      'scripts',
      'uploads',
      'logs'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    }

    return true;
  }

  generateSetupReport(config, results) {
    const reportPath = path.join(this.foundationPath, 'logs', 'setup-report.json');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      config: config,
      results: results,
      success: Object.values(results).every(result => result === true),
      foundation: {
        version: '3.0',
        features: this.getCapacityFeatures(config.capacity)
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    this.log(`Setup report saved: ${reportPath}`);
    
    return report;
  }

  getCapacityFeatures(capacity) {
    const features = {
      'nano': ['basic-auth', 'simple-routing'],
      'micro': ['redis-cache', 'queue-system', 'search-service', 'push-notifications'],
      'small': ['load-balancer', 'auto-scaling', 'websocket', 'advanced-security'],
      'large': ['kubernetes-orchestration', 'service-discovery', 'global-cdn', 'zero-trust-security'],
      'enterprise': ['kubernetes-native', 'service-mesh', 'global-load-balancing', 'data-governance', 'mlops-complete']
    };

    return features[capacity] || features['micro'];
  }

  validateSetup() {
    this.log('Validating setup...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'replit.md'
    ];

    let valid = true;
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        this.log(`Missing required file: ${file}`, 'error');
        valid = false;
      }
    }

    if (valid) {
      this.log('Setup validation successful', 'success');
    }

    return valid;
  }

  run() {
    this.log('🚀 duEuler Foundation Complete Setup v3.0', 'setup');
    this.log('='.repeat(60));

    const config = this.parseArguments();
    this.log(`Configuration: ${JSON.stringify(config, null, 2)}`);

    const results = {};

    // Execute setup steps
    results.directoryStructure = this.createDirectoryStructure();
    results.packageJson = this.setupPackageJson(config);
    results.configFiles = this.setupConfigFiles(config);
    results.replitMd = this.setupReplitMd(config);
    results.dependencies = this.installDependencies(config);
    results.validation = this.validateSetup();

    // Generate report
    const report = this.generateSetupReport(config, results);

    this.log('='.repeat(60));
    
    if (report.success) {
      this.log(`✨ Setup complete for ${config.capacity.toUpperCase()} capacity!`, 'success');
      this.log(`📁 Project: ${config.projectName}`);
      this.log(`🎯 Features: ${report.foundation.features.join(', ')}`);
      this.log('🚀 Ready for development!');
    } else {
      this.log('Setup completed with errors. Check the report for details.', 'warning');
    }

    return report.success;
  }
}

// Execute if run directly
if (require.main === module) {
  const setup = new FoundationSetup();
  const success = setup.run();
  process.exit(success ? 0 : 1);
}

module.exports = FoundationSetup;