#!/usr/bin/env node

/**
 * duEuler Foundation - Automatic Dependency Installation
 * Automatically installs dependencies based on project capacity
 * Version: 3.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.foundationPath = path.join(this.projectRoot, 'dueuler-foundation');
    this.templatesPath = path.join(this.foundationPath, 'templates');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📦',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  detectCapacity() {
    try {
      if (fs.existsSync(this.packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
        if (packageJson.foundation && packageJson.foundation.capacity) {
          return packageJson.foundation.capacity;
        }
      }

      // Detect based on existing dependencies
      if (fs.existsSync(this.packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
        const totalDeps = Object.keys(packageJson.dependencies || {}).length + 
                         Object.keys(packageJson.devDependencies || {}).length;

        if (totalDeps > 120) return 'enterprise';
        if (totalDeps > 80) return 'large';
        if (totalDeps > 50) return 'small';
        if (totalDeps > 30) return 'micro';
        return 'nano';
      }

      return 'micro'; // Default
    } catch (error) {
      this.log(`Error detecting capacity: ${error.message}`, 'warning');
      return 'micro';
    }
  }

  getTemplateFile(capacity) {
    const templates = {
      'nano': 'package.json.template',
      'micro': 'package.json.micro.template',
      'small': 'package.json.small.template', 
      'large': 'package.json.large.template',
      'enterprise': 'package.json.enterprise.template'
    };

    return templates[capacity] || templates['micro'];
  }

  installDependenciesForCapacity(capacity) {
    this.log(`Installing dependencies for ${capacity.toUpperCase()} capacity...`);

    const templateFile = this.getTemplateFile(capacity);
    const templatePath = path.join(this.templatesPath, templateFile);

    if (!fs.existsSync(templatePath)) {
      this.log(`Template not found: ${templateFile}`, 'error');
      return false;
    }

    try {
      // Read template
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const templateData = JSON.parse(templateContent);

      // Read current package.json
      let currentPackageJson = {};
      if (fs.existsSync(this.packageJsonPath)) {
        currentPackageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      }

      // Merge dependencies
      const mergedPackageJson = {
        ...currentPackageJson,
        dependencies: {
          ...(currentPackageJson.dependencies || {}),
          ...(templateData.dependencies || {})
        },
        devDependencies: {
          ...(currentPackageJson.devDependencies || {}),
          ...(templateData.devDependencies || {})
        },
        optionalDependencies: {
          ...(currentPackageJson.optionalDependencies || {}),
          ...(templateData.optionalDependencies || {})
        },
        scripts: {
          ...(currentPackageJson.scripts || {}),
          ...(templateData.scripts || {})
        },
        foundation: {
          ...(currentPackageJson.foundation || {}),
          ...(templateData.foundation || {}),
          capacity: capacity,
          lastUpdated: new Date().toISOString()
        }
      };

      // Write updated package.json
      fs.writeFileSync(
        this.packageJsonPath, 
        JSON.stringify(mergedPackageJson, null, 2), 
        'utf8'
      );

      this.log('Updated package.json with new dependencies');

      // Install dependencies
      this.log('Installing npm packages...');
      execSync('npm install', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });

      this.log(`Successfully installed ${capacity} capacity dependencies!`, 'success');
      return true;

    } catch (error) {
      this.log(`Error installing dependencies: ${error.message}`, 'error');
      return false;
    }
  }

  validateInstallation() {
    this.log('Validating installation...');

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        this.log('node_modules directory not found', 'warning');
        return false;
      }

      // Check package-lock.json
      const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
      if (!fs.existsSync(packageLockPath)) {
        this.log('package-lock.json not found', 'warning');
        return false;
      }

      // Verify critical packages
      const criticalPackages = [
        'express', 'react', 'drizzle-orm', 'zod', 'typescript'
      ];

      for (const pkg of criticalPackages) {
        const pkgPath = path.join(nodeModulesPath, pkg);
        if (!fs.existsSync(pkgPath)) {
          this.log(`Critical package missing: ${pkg}`, 'error');
          return false;
        }
      }

      this.log('Installation validation successful!', 'success');
      return true;

    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      return false;
    }
  }

  generateInstallationReport(capacity) {
    const reportPath = path.join(this.foundationPath, 'logs', 'installation-report.json');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    const report = {
      timestamp: new Date().toISOString(),
      capacity: capacity,
      dependencies: {
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length,
        optional: Object.keys(packageJson.optionalDependencies || {}).length,
        total: Object.keys(packageJson.dependencies || {}).length + 
               Object.keys(packageJson.devDependencies || {}).length +
               Object.keys(packageJson.optionalDependencies || {}).length
      },
      foundation: packageJson.foundation || {},
      scripts: Object.keys(packageJson.scripts || {}),
      success: true
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    this.log(`Installation report saved: ${reportPath}`);
    
    return report;
  }

  run() {
    this.log('🚀 duEuler Foundation Dependency Installer v3.0');
    this.log('='.repeat(50));

    // Parse command line arguments
    const args = process.argv.slice(2);
    let targetCapacity = null;

    if (args.includes('--capacity')) {
      const capacityIndex = args.indexOf('--capacity');
      targetCapacity = args[capacityIndex + 1];
    }

    // Detect or use provided capacity
    const capacity = targetCapacity || this.detectCapacity();
    this.log(`Target capacity: ${capacity.toUpperCase()}`);

    // Install dependencies
    const installSuccess = this.installDependenciesForCapacity(capacity);
    
    if (!installSuccess) {
      this.log('Installation failed!', 'error');
      process.exit(1);
    }

    // Validate installation
    const validationSuccess = this.validateInstallation();
    
    if (!validationSuccess) {
      this.log('Installation validation failed!', 'warning');
    }

    // Generate report
    const report = this.generateInstallationReport(capacity);
    
    this.log('='.repeat(50));
    this.log(`✨ Installation complete for ${capacity.toUpperCase()} capacity!`, 'success');
    this.log(`📊 Total dependencies: ${report.dependencies.total}`);
    this.log(`📋 Scripts available: ${report.scripts.length}`);
    this.log('🎯 Ready for development!');
  }
}

// Execute if run directly
if (require.main === module) {
  const installer = new DependencyInstaller();
  installer.run();
}

module.exports = DependencyInstaller;