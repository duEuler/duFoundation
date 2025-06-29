#!/usr/bin/env node

/*
* duEuler Foundation File
* Category: validation-automation
* Capacity: du:capacity:[all]
* Dependencies: [fs, path, foundation-structure/**]
* Related Files: [FOUNDATION_METADATA.md, du-dependency-tree.json, ANOMALY_TRACKER.md]
* Errors Solved: [manual validation overhead, missing documentation checks]
* Configuration: [automated validation rules for foundation compliance]
* Upgrade Path: [extend validation rules as foundation grows]
* Version Compatibility: [Node 18+, all platforms]
* 
* MANDATORY DOCUMENTATION:
* - Purpose: Automated validation of foundation files compliance
* - Usage: node foundation-structure/scripts/du-foundation-validator.cjs
* - Prerequisites: Node.js 18+, foundation structure in place
* - Error Handling: Detailed reporting of violations with remediation
* - Performance Impact: Fast validation, runs in <2 seconds
* - Security Considerations: File system access only, no network calls
*/

const fs = require('fs');
const path = require('path');

class FoundationValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validationResults = {
            filesChecked: 0,
            compliantFiles: 0,
            violationFiles: 0,
            missingDocumentation: 0,
            orphanedFiles: 0
        };
    }

    /**
     * Validates if file has mandatory duEuler documentation header
     * @param {string} filePath - Path to file being validated
     * @param {string} content - File content to check
     */
    validateDocumentationHeader(filePath, content) {
        const requiredFields = [
            'duEuler Foundation File',
            'Category:',
            'Capacity:',
            'Dependencies:',
            'Related Files:',
            'Purpose:',
            'Usage:',
            'Prerequisites:'
        ];

        const missingFields = requiredFields.filter(field => 
            !content.includes(field)
        );

        if (missingFields.length > 0) {
            this.errors.push({
                file: filePath,
                type: 'missing_documentation',
                severity: 'high',
                message: `Missing required documentation fields: ${missingFields.join(', ')}`,
                solution: 'Add mandatory documentation header using template from FOUNDATION_METADATA.md'
            });
            this.validationResults.missingDocumentation++;
        } else {
            this.validationResults.compliantFiles++;
        }
    }

    /**
     * Validates capacity configuration compliance
     * @param {string} filePath - Path to capacity config file
     * @param {Object} config - Parsed configuration object
     */
    validateCapacityConfig(filePath, config) {
        const requiredSections = [
            'capacity',
            'services',
            'performance',
            'deployment',
            'logging'
        ];

        const missingSections = requiredSections.filter(section => 
            !config[section]
        );

        if (missingSections.length > 0) {
            this.errors.push({
                file: filePath,
                type: 'invalid_capacity_config',
                severity: 'critical',
                message: `Missing required config sections: ${missingSections.join(', ')}`,
                solution: 'Add missing sections using template from other capacity configs'
            });
        }

        // Validate capacity level consistency
        const fileName = path.basename(filePath);
        const capacityFromFile = fileName.match(/du-capacity-(\w+)-config/);
        if (capacityFromFile && config.capacity && 
            config.capacity.level !== capacityFromFile[1]) {
            this.errors.push({
                file: filePath,
                type: 'capacity_mismatch',
                severity: 'high',
                message: `Capacity level mismatch: file suggests ${capacityFromFile[1]} but config says ${config.capacity.level}`,
                solution: 'Update either filename or config.capacity.level to match'
            });
        }
    }

    /**
     * Validates dependency declarations match actual dependencies
     * @param {string} filePath - Path to file being validated
     * @param {string} content - File content to analyze
     */
    validateDependencyDeclarations(filePath, content) {
        // Extract declared dependencies from header
        const dependencyMatch = content.match(/Dependencies:\s*\[(.*?)\]/);
        if (!dependencyMatch) return;

        const declaredDeps = dependencyMatch[1]
            .split(',')
            .map(dep => dep.trim().replace(/['"]/g, ''));

        // Extract actual imports/requires
        const importMatches = content.match(/(?:import.*from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g) || [];
        const actualDeps = importMatches.map(match => {
            const importMatch = match.match(/['"]([^'"]+)['"]/);
            return importMatch ? importMatch[1] : null;
        }).filter(Boolean);

        // Find undeclared dependencies
        const undeclaredDeps = actualDeps.filter(dep => 
            !declaredDeps.some(declared => 
                declared.includes(dep) || dep.includes(declared)
            )
        );

        if (undeclaredDeps.length > 0) {
            this.warnings.push({
                file: filePath,
                type: 'undeclared_dependencies',
                severity: 'medium',
                message: `Undeclared dependencies found: ${undeclaredDeps.join(', ')}`,
                solution: 'Update Dependencies field in file header'
            });
        }
    }

    /**
     * Checks for orphaned files not referenced by any other files
     * @param {Array} allFiles - List of all foundation files
     */
    validateOrphanedFiles(allFiles) {
        const referenceCounts = {};
        
        // Initialize reference counts
        allFiles.forEach(file => {
            referenceCounts[file] = 0;
        });

        // Count references between files
        allFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                allFiles.forEach(otherFile => {
                    if (file !== otherFile) {
                        const fileName = path.basename(otherFile);
                        const relativePath = path.relative(path.dirname(file), otherFile);
                        
                        if (content.includes(fileName) || content.includes(relativePath)) {
                            referenceCounts[otherFile]++;
                        }
                    }
                });
            } catch (error) {
                // Skip files that can't be read
            }
        });

        // Report orphaned files
        Object.entries(referenceCounts).forEach(([file, count]) => {
            if (count === 0 && !file.includes('FOUNDATION_METADATA.md')) {
                this.warnings.push({
                    file: file,
                    type: 'orphaned_file',
                    severity: 'low',
                    message: 'File not referenced by any other foundation files',
                    solution: 'Either reference this file or document in anomalies/orphaned/'
                });
                this.validationResults.orphanedFiles++;
            }
        });
    }

    /**
     * Validates naming conventions compliance
     * @param {string} filePath - Path to file being validated
     */
    validateNamingConventions(filePath) {
        const fileName = path.basename(filePath);
        const expectedPrefixes = ['du-', 'cap-', 'mon-', 'sec-', 'perf-', 'test-', 'ano-'];
        
        // Skip certain system files
        if (fileName.includes('FOUNDATION_METADATA') || 
            fileName.includes('ANOMALY_TRACKER') ||
            fileName.includes('package.json')) {
            return;
        }

        const hasValidPrefix = expectedPrefixes.some(prefix => 
            fileName.startsWith(prefix)
        );

        if (!hasValidPrefix) {
            this.warnings.push({
                file: filePath,
                type: 'naming_convention',
                severity: 'low',
                message: `File doesn't follow naming convention. Expected prefix: ${expectedPrefixes.join(', ')}`,
                solution: 'Rename file to follow du-[component]-[capacity]-[version] pattern'
            });
        }
    }

    /**
     * Main validation execution
     */
    async validateFoundation() {
        console.log('🔍 Starting duEuler Foundation Validation...\n');

        const foundationDir = 'foundation-structure';
        if (!fs.existsSync(foundationDir)) {
            console.error('❌ Foundation structure directory not found!');
            return false;
        }

        // Get all foundation files
        const allFiles = this.getAllFiles(foundationDir);
        
        console.log(`📁 Found ${allFiles.length} files to validate\n`);

        // Validate each file
        for (const file of allFiles) {
            this.validationResults.filesChecked++;
            
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Run all validations
                this.validateDocumentationHeader(file, content);
                this.validateDependencyDeclarations(file, content);
                this.validateNamingConventions(file);
                
                // Special validations for specific file types
                if (file.includes('capacity-config') && file.endsWith('.json')) {
                    const config = JSON.parse(content);
                    this.validateCapacityConfig(file, config);
                }
                
            } catch (error) {
                this.errors.push({
                    file: file,
                    type: 'file_read_error',
                    severity: 'critical',
                    message: `Could not process file: ${error.message}`,
                    solution: 'Check file permissions and format'
                });
            }
        }

        // Check for orphaned files
        this.validateOrphanedFiles(allFiles);

        // Update violation count
        this.validationResults.violationFiles = this.validationResults.filesChecked - this.validationResults.compliantFiles;

        this.generateReport();
        return this.errors.length === 0;
    }

    /**
     * Recursively get all files in directory
     * @param {string} dir - Directory to scan
     * @returns {Array} - Array of file paths
     */
    getAllFiles(dir) {
        const files = [];
        
        const scan = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else {
                    files.push(fullPath);
                }
            });
        };
        
        scan(dir);
        return files;
    }

    /**
     * Generate and display validation report
     */
    generateReport() {
        console.log('📊 VALIDATION REPORT');
        console.log('==========================================');
        console.log(`Files Checked: ${this.validationResults.filesChecked}`);
        console.log(`Compliant Files: ${this.validationResults.compliantFiles}`);
        console.log(`Files with Violations: ${this.validationResults.violationFiles}`);
        console.log(`Missing Documentation: ${this.validationResults.missingDocumentation}`);
        console.log(`Orphaned Files: ${this.validationResults.orphanedFiles}`);
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}\n`);

        // Show compliance percentage
        const complianceRate = this.validationResults.filesChecked > 0 
            ? (this.validationResults.compliantFiles / this.validationResults.filesChecked * 100).toFixed(1)
            : 0;
        
        console.log(`📈 Compliance Rate: ${complianceRate}%\n`);

        // Report errors
        if (this.errors.length > 0) {
            console.log('🚫 ERRORS:');
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.severity.toUpperCase()}] ${error.file}`);
                console.log(`   Issue: ${error.message}`);
                console.log(`   Solution: ${error.solution}\n`);
            });
        }

        // Report warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. [${warning.severity.toUpperCase()}] ${warning.file}`);
                console.log(`   Issue: ${warning.message}`);
                console.log(`   Solution: ${warning.solution}\n`);
            });
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All validations passed! Foundation is compliant.');
        }

        // Save report to file
        this.saveReportToFile();
    }

    /**
     * Save validation report to anomalies directory
     */
    saveReportToFile() {
        const reportData = {
            timestamp: new Date().toISOString(),
            results: this.validationResults,
            errors: this.errors,
            warnings: this.warnings,
            compliance_rate: this.validationResults.filesChecked > 0 
                ? (this.validationResults.compliantFiles / this.validationResults.filesChecked * 100).toFixed(1)
                : 0
        };

        const reportPath = 'foundation-structure/anomalies/validation-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📝 Report saved to: ${reportPath}`);
    }
}

// Execute validation if run directly
if (require.main === module) {
    const validator = new FoundationValidator();
    validator.validateFoundation()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Validation failed:', error);
            process.exit(1);
        });
}

module.exports = FoundationValidator;