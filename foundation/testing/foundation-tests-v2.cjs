#!/usr/bin/env node

/*
 * duEuler Foundation Test Suite v2.0
 * 
 * Category: testing-automation
 * Capacity: du:capacity:[all]
 * Dependencies: ['fs', 'path', 'foundation configs', 'automation scripts']
 * Related Files: ['validator.cjs', 'upgrader.cjs', 'initializer.cjs', 'exporter.cjs']
 * Purpose: Comprehensive test suite for reorganized duEuler Foundation
 * Usage: node dueuler-foundation/testing/foundation-tests-v2.cjs
 */

const fs = require('fs');
const path = require('path');

class FoundationTestSuiteV2 {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.capacityLevels = ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'];
        this.foundationBase = 'dueuler-foundation';
    }

    log(message, color = 'white') {
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

    assert(condition, testName) {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
            this.log(`  ✅ ${testName}`, 'green');
            return true;
        } else {
            this.testResults.failed++;
            this.testResults.errors.push(testName);
            this.log(`  ❌ ${testName}`, 'red');
            return false;
        }
    }

    async runAllTests() {
        this.log('🧪 Starting duEuler Foundation Test Suite v2.0\n', 'magenta');
        
        try {
            await this.testDirectoryStructure();
            await this.testCapacityConfigurations();
            await this.testAutomationScripts();
            await this.testMonitoringServices();
            await this.testSecurityComponents();
            await this.testProjectTemplates();
            await this.testDependencyMappings();
            await this.testDocumentationCompliance();
            
            this.generateTestReport();
            return this.testResults.failed === 0;
            
        } catch (error) {
            this.log(`❌ Test suite execution failed: ${error.message}`, 'red');
            return false;
        }
    }

    async testDirectoryStructure() {
        this.log('🏗️ Testing Directory Structure...', 'cyan');
        
        const requiredDirs = [
            'core', 'configs', 'automation', 'testing', 'monitoring', 
            'security', 'dependencies', 'anomalies', 'templates', 'exports'
        ];
        
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.foundationBase, dir);
            this.assert(fs.existsSync(dirPath), `Directory exists: ${dir}`);
        }
        
        this.log('✅ Directory structure tests completed\n', 'green');
    }

    async testCapacityConfigurations() {
        this.log('📊 Testing Capacity Configurations...', 'cyan');
        
        for (const capacity of this.capacityLevels) {
            await this.testSingleCapacityConfig(capacity);
        }
        
        this.log('✅ Capacity configuration tests completed\n', 'green');
    }

    async testSingleCapacityConfig(capacity) {
        const testName = `Capacity Config: ${capacity}`;
        
        try {
            const configPath = path.join(this.foundationBase, 'configs', capacity, `du-capacity-${capacity}-config.json`);
            
            // Test 1: File exists
            this.assert(fs.existsSync(configPath), `${testName} - Config file exists`);
            
            if (fs.existsSync(configPath)) {
                // Test 2: Valid JSON
                const content = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(content);
                this.assert(config !== null, `${testName} - Valid JSON format`);
                
                // Test 3: Has metadata
                this.assert(config._metadata !== undefined, `${testName} - Has metadata section`);
                
                // Test 4: Capacity level consistency
                this.assert(config.capacity_level === capacity, `${testName} - Capacity level matches`);
            }
            
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`${testName} - Configuration test failed: ${error.message}`);
            this.log(`  ❌ ${testName} - Configuration test failed: ${error.message}`, 'red');
        }
    }

    async testAutomationScripts() {
        this.log('🤖 Testing Automation Scripts...', 'cyan');
        
        const scripts = [
            'validator.cjs',
            'upgrader.cjs', 
            'initializer.cjs',
            'exporter.cjs',
            'validate-structure.cjs'
        ];
        
        for (const script of scripts) {
            const scriptPath = path.join(this.foundationBase, 'automation', script);
            this.assert(fs.existsSync(scriptPath), `Script exists: ${script}`);
            
            if (fs.existsSync(scriptPath)) {
                const content = fs.readFileSync(scriptPath, 'utf8');
                this.assert(content.includes('duEuler Foundation'), `${script} - Has foundation header`);
                this.assert(content.includes('#!/usr/bin/env node'), `${script} - Has shebang`);
            }
        }
        
        this.log('✅ Automation scripts tests completed\n', 'green');
    }

    async testMonitoringServices() {
        this.log('📊 Testing Monitoring Services...', 'cyan');
        
        const services = [
            'PrometheusService.ts',
            'GrafanaService.ts',
            'MonitoringIntegration.ts'
        ];
        
        for (const service of services) {
            const servicePath = path.join(this.foundationBase, 'monitoring', service);
            this.assert(fs.existsSync(servicePath), `Monitoring service exists: ${service}`);
            
            if (fs.existsSync(servicePath)) {
                const content = fs.readFileSync(servicePath, 'utf8');
                this.assert(content.includes('export'), `${service} - Has TypeScript exports`);
                this.assert(content.includes('class') || content.includes('function'), `${service} - Has implementation`);
            }
        }
        
        this.log('✅ Monitoring services tests completed\n', 'green');
    }

    async testSecurityComponents() {
        this.log('🔐 Testing Security Components...', 'cyan');
        
        const securityFile = path.join(this.foundationBase, 'security', 'du-secrets-manager.ts');
        this.assert(fs.existsSync(securityFile), 'Security component exists: du-secrets-manager.ts');
        
        if (fs.existsSync(securityFile)) {
            const content = fs.readFileSync(securityFile, 'utf8');
            this.assert(content.includes('SecretsManager'), 'SecretsManager - Has main class');
            this.assert(content.includes('encrypt') || content.includes('decrypt'), 'SecretsManager - Has encryption methods');
        }
        
        this.log('✅ Security components tests completed\n', 'green');
    }

    async testProjectTemplates() {
        this.log('📄 Testing Project Templates...', 'cyan');
        
        const templates = [
            'package.json.template',
            '.env.template',
            'tsconfig.json.template'
        ];
        
        for (const template of templates) {
            const templatePath = path.join(this.foundationBase, 'templates', template);
            this.assert(fs.existsSync(templatePath), `Template exists: ${template}`);
            
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                this.assert(content.includes('{{') || content.includes('duEuler'), `${template} - Has template variables or foundation reference`);
            }
        }
        
        this.log('✅ Project templates tests completed\n', 'green');
    }

    async testDependencyMappings() {
        this.log('📦 Testing Dependency Mappings...', 'cyan');
        
        const depTreePath = path.join(this.foundationBase, 'dependencies', 'du-dependency-tree.json');
        this.assert(fs.existsSync(depTreePath), 'Dependency tree file exists');
        
        if (fs.existsSync(depTreePath)) {
            try {
                const content = fs.readFileSync(depTreePath, 'utf8');
                const depTree = JSON.parse(content);
                this.assert(depTree._metadata !== undefined, 'Dependency tree - Has metadata');
                this.assert(depTree.foundation_metadata !== undefined, 'Dependency tree - Has foundation metadata');
            } catch (error) {
                this.log(`  ❌ Dependency tree - Parse error: ${error.message}`, 'red');
                this.testResults.failed++;
                this.testResults.errors.push(`Dependency tree - Parse error: ${error.message}`);
            }
        }
        
        this.log('✅ Dependency mappings tests completed\n', 'green');
    }

    async testDocumentationCompliance() {
        this.log('📚 Testing Documentation Compliance...', 'cyan');
        
        const coreFiles = [
            'README.md',
            'CHANGELOG.md', 
            'FOUNDATION_METADATA.md',
            'FOUNDATION_SUMMARY.md'
        ];
        
        for (const file of coreFiles) {
            const filePath = path.join(this.foundationBase, 'core', file);
            this.assert(fs.existsSync(filePath), `Documentation file exists: ${file}`);
            
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                this.assert(content.length > 100, `${file} - Has substantial content`);
                this.assert(content.includes('duEuler'), `${file} - References duEuler Foundation`);
            }
        }
        
        this.log('✅ Documentation compliance tests completed\n', 'green');
    }

    generateTestReport() {
        this.log('\n📊 FOUNDATION TEST REPORT v2.0', 'magenta');
        this.log('==========================================', 'magenta');
        this.log(`Total Tests: ${this.testResults.total}`, 'white');
        this.log(`Passed: ${this.testResults.passed}`, 'green');
        this.log(`Failed: ${this.testResults.failed}`, 'red');
        this.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`, 'cyan');
        
        if (this.testResults.failed > 0) {
            this.log('\n❌ FAILED TESTS:', 'red');
            this.testResults.errors.forEach((error, index) => {
                this.log(`${index + 1}. ${error}`, 'white');
            });
        }
        
        if (this.testResults.failed === 0) {
            this.log('\n🎉 All tests passed! Foundation is ready for production.', 'green');
        } else {
            this.log(`\n⚠️ ${this.testResults.failed} tests failed. Please review and fix issues.`, 'yellow');
        }

        // Save test report
        const reportPath = path.join(this.foundationBase, 'testing', 'reports', 'test-report-v2.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                version: '2.0',
                results: this.testResults
            }, null, 2));
            this.log(`\n📋 Test report saved: ${reportPath}`, 'cyan');
        } catch (error) {
            this.log(`\n⚠️ Could not save test report: ${error.message}`, 'yellow');
        }
    }
}

async function main() {
    const testSuite = new FoundationTestSuiteV2();
    const success = await testSuite.runAllTests();
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = FoundationTestSuiteV2;