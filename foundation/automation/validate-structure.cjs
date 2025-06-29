#!/usr/bin/env node

/*
 * duEuler Foundation Structure Validator
 * 
 * Category: automation
 * Capacity: du:capacity:[all]
 * Dependencies: ['fs', 'path']
 * Related Files: ['validator.cjs', 'exporter.cjs']
 * Purpose: Validate new foundation structure and imports
 * Usage: node dueuler-foundation/automation/validate-structure.cjs
 */

const fs = require('fs');
const path = require('path');

function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateDirectoryStructure() {
  log('🏗️ Validating directory structure...', 'cyan');
  
  const requiredDirs = [
    'dueuler-foundation/core',
    'dueuler-foundation/configs',
    'dueuler-foundation/automation',
    'dueuler-foundation/testing',
    'dueuler-foundation/monitoring',
    'dueuler-foundation/security',
    'dueuler-foundation/dependencies',
    'dueuler-foundation/anomalies',
    'dueuler-foundation/templates',
    'dueuler-foundation/exports'
  ];
  
  let allValid = true;
  
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      log(`  ✅ ${dir}`, 'green');
    } else {
      log(`  ❌ ${dir} - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateCoreFiles() {
  log('\n📚 Validating core files...', 'cyan');
  
  const coreFiles = [
    'dueuler-foundation/core/README.md',
    'dueuler-foundation/core/CHANGELOG.md',
    'dueuler-foundation/core/FOUNDATION_METADATA.md',
    'dueuler-foundation/core/FOUNDATION_SUMMARY.md'
  ];
  
  let allValid = true;
  
  for (const file of coreFiles) {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateCapacityConfigs() {
  log('\n⚙️ Validating capacity configurations...', 'cyan');
  
  const capacities = ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'];
  let allValid = true;
  
  for (const capacity of capacities) {
    const configFile = `dueuler-foundation/configs/${capacity}/du-capacity-${capacity}-config.json`;
    if (fs.existsSync(configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        if (config._metadata && config.capacity_level === capacity) {
          log(`  ✅ ${capacity} configuration`, 'green');
        } else {
          log(`  ⚠️ ${capacity} configuration - Invalid format`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ ${capacity} configuration - Parse error`, 'red');
        allValid = false;
      }
    } else {
      log(`  ❌ ${capacity} configuration - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateAutomationScripts() {
  log('\n🤖 Validating automation scripts...', 'cyan');
  
  const scripts = [
    'dueuler-foundation/automation/validator.cjs',
    'dueuler-foundation/automation/upgrader.cjs',
    'dueuler-foundation/automation/initializer.cjs',
    'dueuler-foundation/automation/exporter.cjs'
  ];
  
  let allValid = true;
  
  for (const script of scripts) {
    if (fs.existsSync(script)) {
      const content = fs.readFileSync(script, 'utf8');
      if (content.includes('duEuler Foundation')) {
        log(`  ✅ ${path.basename(script)}`, 'green');
      } else {
        log(`  ⚠️ ${path.basename(script)} - Missing foundation header`, 'yellow');
      }
    } else {
      log(`  ❌ ${path.basename(script)} - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateMonitoringServices() {
  log('\n📊 Validating monitoring services...', 'cyan');
  
  const services = [
    'dueuler-foundation/monitoring/PrometheusService.ts',
    'dueuler-foundation/monitoring/GrafanaService.ts',
    'dueuler-foundation/monitoring/MonitoringIntegration.ts'
  ];
  
  let allValid = true;
  
  for (const service of services) {
    if (fs.existsSync(service)) {
      log(`  ✅ ${path.basename(service)}`, 'green');
    } else {
      log(`  ❌ ${path.basename(service)} - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateSecurityComponents() {
  log('\n🔐 Validating security components...', 'cyan');
  
  const securityFile = 'dueuler-foundation/security/du-secrets-manager.ts';
  
  if (fs.existsSync(securityFile)) {
    log(`  ✅ ${path.basename(securityFile)}`, 'green');
    return true;
  } else {
    log(`  ❌ ${path.basename(securityFile)} - Missing`, 'red');
    return false;
  }
}

function validateTemplates() {
  log('\n📄 Validating project templates...', 'cyan');
  
  const templates = [
    'dueuler-foundation/templates/package.json.template',
    'dueuler-foundation/templates/.env.template',
    'dueuler-foundation/templates/tsconfig.json.template'
  ];
  
  let allValid = true;
  
  for (const template of templates) {
    if (fs.existsSync(template)) {
      const content = fs.readFileSync(template, 'utf8');
      if (content.includes('{{') || content.includes('duEuler Foundation')) {
        log(`  ✅ ${path.basename(template)}`, 'green');
      } else {
        log(`  ⚠️ ${path.basename(template)} - Missing template variables`, 'yellow');
      }
    } else {
      log(`  ❌ ${path.basename(template)} - Missing`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateLegacyCleanup() {
  log('\n🧹 Validating legacy cleanup...', 'cyan');
  
  const legacyItems = [
    'foundation-structure',
    'src/monitoring',
    'src/security'
  ];
  
  let cleanupNeeded = false;
  
  for (const item of legacyItems) {
    if (fs.existsSync(item)) {
      log(`  ⚠️ ${item} - Still exists (should be moved/removed)`, 'yellow');
      cleanupNeeded = true;
    } else {
      log(`  ✅ ${item} - Properly cleaned up`, 'green');
    }
  }
  
  if (fs.existsSync('legacy-docs') && fs.readdirSync('legacy-docs').length > 0) {
    log(`  ✅ legacy-docs - Contains ${fs.readdirSync('legacy-docs').length} files`, 'green');
  }
  
  return !cleanupNeeded;
}

function countFoundationFiles() {
  let count = 0;
  function countRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        countRecursive(fullPath);
      } else {
        count++;
      }
    }
  }
  countRecursive('dueuler-foundation');
  return count;
}

function main() {
  log('🚀 Starting duEuler Foundation Structure Validation...', 'magenta');
  
  const validations = [
    ['Directory Structure', validateDirectoryStructure],
    ['Core Files', validateCoreFiles],
    ['Capacity Configurations', validateCapacityConfigs],
    ['Automation Scripts', validateAutomationScripts],
    ['Monitoring Services', validateMonitoringServices],
    ['Security Components', validateSecurityComponents],
    ['Project Templates', validateTemplates],
    ['Legacy Cleanup', validateLegacyCleanup]
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const [name, validator] of validations) {
    const passed = validator();
    results.push({ name, passed });
    if (!passed) allPassed = false;
  }
  
  // Summary
  log('\n📋 Validation Summary:', 'magenta');
  for (const { name, passed } of results) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${name}`, color);
  }
  
  log(`\n📊 Foundation Statistics:`, 'cyan');
  log(`   📁 Total files: ${countFoundationFiles()}`, 'white');
  log(`   📦 Capacity configs: 6 levels`, 'white');
  log(`   🤖 Automation scripts: 4 tools`, 'white');
  log(`   🔧 Templates: 3 project templates`, 'white');
  
  if (allPassed) {
    log('\n🎉 All validations passed! Foundation structure is ready.', 'green');
    return 0;
  } else {
    log('\n⚠️ Some validations failed. Please review and fix issues.', 'yellow');
    return 1;
  }
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { 
  validateDirectoryStructure,
  validateCapacityConfigs,
  validateMonitoringServices 
};