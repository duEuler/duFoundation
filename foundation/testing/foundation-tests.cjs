/*
* duEuler Foundation File
* Category: testing-automation
* Capacity: du:capacity:[all]
* Dependencies: [FOUNDATION_METADATA.md, capacity-configs/**, scripts/**]
* Related Files: [du-foundation-validator.cjs, du-capacity-upgrader.cjs, du-foundation-initializer.cjs]
* Errors Solved: [untested foundation components, configuration validation gaps, integration failures]
* Configuration: [comprehensive test suite for all foundation components]
* Upgrade Path: [extend tests as foundation grows, add performance benchmarks]
* Version Compatibility: [v2.0+]
* 
* MANDATORY DOCUMENTATION:
* - Purpose: Comprehensive test suite for duEuler Foundation components
* - Usage: node foundation-structure/tests/du-foundation-tests.cjs
* - Prerequisites: Foundation structure, all capacity configs available
* - Error Handling: Detailed test reports with failure analysis
* - Performance Impact: Test execution only, no runtime impact
* - Security Considerations: No sensitive data in test outputs
*/

const fs = require('fs');
const path = require('path');

class FoundationTestSuite {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.capacityLevels = ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'];
    }

    /**
     * Run complete foundation test suite
     */
    async runAllTests() {
        console.log('🧪 Starting duEuler Foundation Test Suite\n');
        
        try {
            // Test categories
            await this.testCapacityConfigurations();
            await this.testFoundationStructure();
            await this.testScriptFunctionality();
            await this.testDependencyMappings();
            await this.testValidationSystem();
            await this.testUpgradePathways();
            await this.testDocumentationCompliance();
            
            this.generateTestReport();
            return this.testResults.failed === 0;
            
        } catch (error) {
            console.error(`❌ Test suite execution failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Test all capacity configurations
     */
    async testCapacityConfigurations() {
        console.log('📊 Testing Capacity Configurations...');
        
        for (const capacity of this.capacityLevels) {
            await this.testSingleCapacityConfig(capacity);
        }
        
        console.log('✅ Capacity configuration tests completed\n');
    }

    /**
     * Test individual capacity configuration
     * @param {string} capacity - Capacity level to test
     */
    async testSingleCapacityConfig(capacity) {
        const testName = `Capacity Config: ${capacity}`;
        
        try {
            const configPath = path.join('foundation-structure', 'capacity-configs', capacity, `du-capacity-${capacity}-config.json`);
            
            // Test 1: File exists
            this.assert(fs.existsSync(configPath), `${testName} - Config file exists`);
            
            // Test 2: Valid JSON
            const content = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(content);
            this.assert(config !== null, `${testName} - Valid JSON format`);
            
            // Test 3: Required sections present
            const requiredSections = ['_metadata', 'capacity', 'services', 'performance', 'deployment'];
            requiredSections.forEach(section => {
                this.assert(config[section] !== undefined, `${testName} - Has ${section} section`);
            });
            
            // Test 4: Capacity level consistency
            this.assert(config.capacity.level === capacity, `${testName} - Capacity level matches filename`);
            
            // Test 5: Metadata completeness
            const requiredMetadata = ['duEuler_foundation_file', 'category', 'capacity', 'purpose'];
            requiredMetadata.forEach(field => {
                this.assert(config._metadata[field] !== undefined, `${testName} - Metadata has ${field}`);
            });
            
            // Test 6: Resource specifications
            const resources = config.capacity.resources;
            this.assert(resources.ram_mb > 0, `${testName} - Valid RAM specification`);
            this.assert(resources.cpu_cores > 0, `${testName} - Valid CPU specification`);
            this.assert(resources.storage_gb > 0, `${testName} - Valid storage specification`);
            
            // Test 7: User range validation
            const userRange = config.capacity.users_range;
            this.assert(userRange.min > 0, `${testName} - Valid minimum users`);
            this.assert(userRange.max > userRange.min, `${testName} - Max users greater than min`);
            
            // Test 8: Performance targets
            const performance = config.performance;
            this.assert(performance.response_time_target_ms > 0, `${testName} - Valid response time target`);
            this.assert(performance.availability_target > 0 && performance.availability_target <= 100, `${testName} - Valid availability target`);
            
        } catch (error) {
            this.recordFailure(`${testName} - Configuration test failed: ${error.message}`);
        }
    }

    /**
     * Test foundation directory structure
     */
    async testFoundationStructure() {
        console.log('📁 Testing Foundation Structure...');
        
        const requiredDirectories = [
            'foundation-structure',
            'foundation-structure/anomalies',
            'foundation-structure/capacity-configs',
            'foundation-structure/dependencies',
            'foundation-structure/scripts',
            'foundation-structure/tests',
            'foundation-structure/documentation'
        ];

        requiredDirectories.forEach(dir => {
            this.assert(fs.existsSync(dir), `Directory exists: ${dir}`);
        });

        const requiredFiles = [
            'foundation-structure/FOUNDATION_METADATA.md',
            'foundation-structure/FOUNDATION_SUMMARY.md',
            'foundation-structure/anomalies/ANOMALY_TRACKER.md'
        ];

        requiredFiles.forEach(file => {
            this.assert(fs.existsSync(file), `File exists: ${file}`);
        });
        
        console.log('✅ Foundation structure tests completed\n');
    }

    /**
     * Test script functionality
     */
    async testScriptFunctionality() {
        console.log('⚙️ Testing Script Functionality...');
        
        const scripts = [
            'foundation-structure/scripts/du-foundation-validator.cjs',
            'foundation-structure/scripts/du-capacity-upgrader.cjs',
            'foundation-structure/scripts/du-foundation-initializer.cjs'
        ];

        scripts.forEach(script => {
            // Test 1: Script exists
            this.assert(fs.existsSync(script), `Script exists: ${path.basename(script)}`);
            
            // Test 2: Valid JavaScript syntax (basic check)
            try {
                const content = fs.readFileSync(script, 'utf8');
                this.assert(content.includes('module.exports'), `${path.basename(script)} - Has module.exports`);
                this.assert(content.includes('duEuler Foundation File'), `${path.basename(script)} - Has foundation header`);
            } catch (error) {
                this.recordFailure(`${path.basename(script)} - Script validation failed: ${error.message}`);
            }
        });
        
        console.log('✅ Script functionality tests completed\n');
    }

    /**
     * Test dependency mappings
     */
    async testDependencyMappings() {
        console.log('📦 Testing Dependency Mappings...');
        
        const dependencyFile = 'foundation-structure/dependencies/du-dependency-tree.json';
        
        try {
            this.assert(fs.existsSync(dependencyFile), 'Dependency tree file exists');
            
            const content = fs.readFileSync(dependencyFile, 'utf8');
            const dependencies = JSON.parse(content);
            
            // Test structure
            this.assert(dependencies.foundation_metadata !== undefined, 'Has foundation metadata');
            this.assert(dependencies.core_dependencies !== undefined, 'Has core dependencies');
            this.assert(dependencies.capacity_specific_exclusions !== undefined, 'Has capacity exclusions');
            
            // Test capacity coverage
            this.capacityLevels.forEach(capacity => {
                const hasCapacityConfig = dependencies.capacity_specific_exclusions[capacity] !== undefined ||
                                        dependencies.monitoring_dependencies?.prometheus?.capacity_support?.includes(capacity);
                this.assert(hasCapacityConfig, `Dependency mapping covers ${capacity} capacity`);
            });
            
        } catch (error) {
            this.recordFailure(`Dependency mapping test failed: ${error.message}`);
        }
        
        console.log('✅ Dependency mapping tests completed\n');
    }

    /**
     * Test validation system
     */
    async testValidationSystem() {
        console.log('🔍 Testing Validation System...');
        
        try {
            // Test validator script exists and has required components
            const validatorPath = 'foundation-structure/scripts/du-foundation-validator.cjs';
            this.assert(fs.existsSync(validatorPath), 'Validator script exists');
            
            const content = fs.readFileSync(validatorPath, 'utf8');
            
            // Test validator has key methods
            const requiredMethods = [
                'validateDocumentationHeader',
                'validateCapacityConfig',
                'validateDependencyDeclarations',
                'validateOrphanedFiles'
            ];
            
            requiredMethods.forEach(method => {
                this.assert(content.includes(method), `Validator has ${method} method`);
            });
            
            // Test validator can handle all file types
            this.assert(content.includes('.json'), 'Validator handles JSON files');
            this.assert(content.includes('.md'), 'Validator handles Markdown files');
            this.assert(content.includes('.cjs'), 'Validator handles CommonJS files');
            
        } catch (error) {
            this.recordFailure(`Validation system test failed: ${error.message}`);
        }
        
        console.log('✅ Validation system tests completed\n');
    }

    /**
     * Test upgrade pathways
     */
    async testUpgradePathways() {
        console.log('⬆️ Testing Upgrade Pathways...');
        
        try {
            // Test upgrade script exists
            const upgraderPath = 'foundation-structure/scripts/du-capacity-upgrader.cjs';
            this.assert(fs.existsSync(upgraderPath), 'Upgrader script exists');
            
            const content = fs.readFileSync(upgraderPath, 'utf8');
            
            // Test upgrader has key functionality
            const requiredFeatures = [
                'validateUpgradePath',
                'generateUpgradePlan',
                'executeUpgrade',
                'rollback'
            ];
            
            requiredFeatures.forEach(feature => {
                this.assert(content.includes(feature), `Upgrader has ${feature} functionality`);
            });
            
            // Test capacity order is defined
            this.assert(content.includes('capacityOrder'), 'Upgrader defines capacity order');
            
            // Test backup functionality
            this.assert(content.includes('createBackup'), 'Upgrader has backup functionality');
            
        } catch (error) {
            this.recordFailure(`Upgrade pathway test failed: ${error.message}`);
        }
        
        console.log('✅ Upgrade pathway tests completed\n');
    }

    /**
     * Test documentation compliance
     */
    async testDocumentationCompliance() {
        console.log('📚 Testing Documentation Compliance...');
        
        try {
            // Test all capacity configs have proper documentation
            for (const capacity of this.capacityLevels) {
                const configPath = path.join('foundation-structure', 'capacity-configs', capacity, `du-capacity-${capacity}-config.json`);
                
                if (fs.existsSync(configPath)) {
                    const content = fs.readFileSync(configPath, 'utf8');
                    const config = JSON.parse(content);
                    
                    // Check metadata documentation
                    const metadata = config._metadata;
                    const requiredDocs = ['purpose', 'usage', 'prerequisites', 'error_handling'];
                    
                    requiredDocs.forEach(doc => {
                        this.assert(metadata[doc] !== undefined, `${capacity} config has ${doc} documentation`);
                    });
                }
            }
            
            // Test anomaly tracking system
            const anomalyPath = 'foundation-structure/anomalies/ANOMALY_TRACKER.md';
            if (fs.existsSync(anomalyPath)) {
                const content = fs.readFileSync(anomalyPath, 'utf8');
                this.assert(content.includes('ANOMALIAS REGISTRADAS'), 'Anomaly tracker has registered anomalies section');
                this.assert(content.includes('TEMPLATE DE REGISTRO'), 'Anomaly tracker has template section');
            }
            
        } catch (error) {
            this.recordFailure(`Documentation compliance test failed: ${error.message}`);
        }
        
        console.log('✅ Documentation compliance tests completed\n');
    }

    /**
     * Assert helper function
     * @param {boolean} condition - Condition to test
     * @param {string} message - Test description
     */
    assert(condition, message) {
        this.testResults.total++;
        
        if (condition) {
            this.testResults.passed++;
            console.log(`  ✅ ${message}`);
        } else {
            this.testResults.failed++;
            console.log(`  ❌ ${message}`);
            this.testResults.errors.push(message);
        }
    }

    /**
     * Record test failure
     * @param {string} message - Failure message
     */
    recordFailure(message) {
        this.testResults.total++;
        this.testResults.failed++;
        console.log(`  ❌ ${message}`);
        this.testResults.errors.push(message);
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        console.log('\n📊 FOUNDATION TEST REPORT');
        console.log('==========================================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Skipped: ${this.testResults.skipped}`);
        
        const successRate = this.testResults.total > 0 
            ? ((this.testResults.passed / this.testResults.total) * 100).toFixed(1)
            : 0;
        
        console.log(`Success Rate: ${successRate}%\n`);

        if (this.testResults.failed > 0) {
            console.log('❌ FAILED TESTS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
            console.log('');
        }

        // Save test report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                success_rate: successRate
            },
            failures: this.testResults.errors,
            recommendation: this.generateRecommendations()
        };

        const reportPath = 'foundation-structure/tests/test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed! Foundation is fully operational.');
        } else {
            console.log('\n⚠️  Some tests failed. Review failures and fix issues before deployment.');
        }
    }

    /**
     * Generate recommendations based on test results
     * @returns {Array} Array of recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.testResults.failed > 0) {
            recommendations.push('Fix failing tests before using foundation in production');
        }
        
        if (this.testResults.failed / this.testResults.total > 0.1) {
            recommendations.push('High failure rate detected - review foundation setup');
        }
        
        if (this.testResults.passed === this.testResults.total) {
            recommendations.push('Foundation is ready for production use');
            recommendations.push('Consider implementing monitoring for live environments');
        }
        
        return recommendations;
    }
}

// CLI execution
if (require.main === module) {
    const testSuite = new FoundationTestSuite();
    
    testSuite.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test suite execution failed:', error);
            process.exit(1);
        });
}

module.exports = FoundationTestSuite;