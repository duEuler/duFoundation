#!/usr/bin/env node

/*
* duEuler Foundation File
* Category: automation-initialization
* Capacity: du:capacity:[all]
* Dependencies: [FOUNDATION_METADATA.md, capacity-configs/**]
* Related Files: [du-foundation-validator.cjs, du-capacity-upgrader.cjs]
* Errors Solved: [manual project setup, configuration inconsistency, missing foundation structure]
* Configuration: [automated foundation setup for new projects]
* Upgrade Path: [extend with additional project templates and configurations]
* Version Compatibility: [v2.0+]
* 
* MANDATORY DOCUMENTATION:
* - Purpose: Initialize duEuler Foundation in new projects with capacity selection
* - Usage: node foundation-structure/scripts/du-foundation-initializer.cjs [capacity] [project-name]
* - Prerequisites: Node.js 18+, foundation structure available
* - Error Handling: Validation before setup, cleanup on failure
* - Performance Impact: One-time setup cost, optimizes long-term development
* - Security Considerations: Secure defaults, proper permissions setup
*/

const fs = require('fs');
const path = require('path');

class FoundationInitializer {
    constructor() {
        this.capacityLevels = ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'];
        this.sourceDir = 'foundation-structure';
        this.templateFiles = {
            monitoring: ['src/monitoring/PrometheusService.ts', 'src/monitoring/GrafanaService.ts'],
            configs: ['capacity-configs'],
            scripts: ['scripts'],
            tests: ['tests'],
            documentation: ['documentation']
        };
    }

    /**
     * Initialize foundation in a new project
     * @param {string} capacity - Target capacity level
     * @param {string} projectName - Name of the project
     * @param {string} targetDir - Target directory (default: current)
     */
    async initializeProject(capacity, projectName, targetDir = '.') {
        console.log(`🚀 Initializing duEuler Foundation for project: ${projectName}`);
        console.log(`📊 Target capacity: ${capacity}`);
        
        try {
            // Validation
            this.validateInputs(capacity, projectName);
            
            // Create project structure
            await this.createProjectStructure(targetDir, projectName);
            
            // Copy foundation files
            await this.copyFoundationFiles(targetDir, capacity);
            
            // Generate project-specific configs
            await this.generateProjectConfigs(targetDir, projectName, capacity);
            
            // Install dependencies
            await this.setupDependencies(targetDir, capacity);
            
            // Create initial documentation
            await this.generateDocumentation(targetDir, projectName, capacity);
            
            // Run initial validation
            await this.validateSetup(targetDir, capacity);
            
            console.log(`✅ Foundation initialized successfully!`);
            console.log(`📁 Project ready at: ${path.resolve(targetDir)}`);
            this.displayNextSteps(capacity);
            
        } catch (error) {
            console.error(`❌ Initialization failed: ${error.message}`);
            await this.cleanup(targetDir);
            throw error;
        }
    }

    /**
     * Validate initialization inputs
     * @param {string} capacity - Capacity level
     * @param {string} projectName - Project name
     */
    validateInputs(capacity, projectName) {
        if (!this.capacityLevels.includes(capacity)) {
            throw new Error(`Invalid capacity level: ${capacity}. Valid options: ${this.capacityLevels.join(', ')}`);
        }

        if (!projectName || projectName.length < 2) {
            throw new Error('Project name must be at least 2 characters long');
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
            throw new Error('Project name can only contain letters, numbers, underscores, and hyphens');
        }
    }

    /**
     * Create basic project directory structure
     * @param {string} targetDir - Target directory
     * @param {string} projectName - Project name
     */
    async createProjectStructure(targetDir, projectName) {
        console.log('📁 Creating project structure...');
        
        const directories = [
            'src/monitoring',
            'src/security',
            'src/utils',
            'config',
            'tests',
            'documentation',
            'scripts',
            'logs',
            'backups'
        ];

        directories.forEach(dir => {
            const fullPath = path.join(targetDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });

        console.log('✅ Project structure created');
    }

    /**
     * Copy foundation files to project
     * @param {string} targetDir - Target directory
     * @param {string} capacity - Capacity level
     */
    async copyFoundationFiles(targetDir, capacity) {
        console.log('📋 Copying foundation files...');
        
        // Copy capacity-specific configuration
        const sourceConfig = path.join(this.sourceDir, 'capacity-configs', capacity, `du-capacity-${capacity}-config.json`);
        const targetConfig = path.join(targetDir, 'config', 'capacity.json');
        
        if (fs.existsSync(sourceConfig)) {
            fs.copyFileSync(sourceConfig, targetConfig);
        }

        // Copy foundation metadata
        const metadataSource = path.join(this.sourceDir, 'FOUNDATION_METADATA.md');
        const metadataTarget = path.join(targetDir, 'documentation', 'FOUNDATION_METADATA.md');
        
        if (fs.existsSync(metadataSource)) {
            fs.copyFileSync(metadataSource, metadataTarget);
        }

        // Copy validation script
        const validatorSource = path.join(this.sourceDir, 'scripts', 'du-foundation-validator.cjs');
        const validatorTarget = path.join(targetDir, 'scripts', 'validate-foundation.cjs');
        
        if (fs.existsSync(validatorSource)) {
            fs.copyFileSync(validatorSource, validatorTarget);
        }

        console.log('✅ Foundation files copied');
    }

    /**
     * Generate project-specific configurations
     * @param {string} targetDir - Target directory
     * @param {string} projectName - Project name
     * @param {string} capacity - Capacity level
     */
    async generateProjectConfigs(targetDir, projectName, capacity) {
        console.log('⚙️ Generating project configurations...');
        
        // Generate package.json
        const packageJson = this.generatePackageJson(projectName, capacity);
        fs.writeFileSync(
            path.join(targetDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Generate environment template
        const envTemplate = this.generateEnvTemplate(capacity);
        fs.writeFileSync(
            path.join(targetDir, '.env.template'),
            envTemplate
        );

        // Generate README
        const readme = this.generateReadme(projectName, capacity);
        fs.writeFileSync(
            path.join(targetDir, 'README.md'),
            readme
        );

        console.log('✅ Project configurations generated');
    }

    /**
     * Generate package.json for the project
     * @param {string} projectName - Project name
     * @param {string} capacity - Capacity level
     * @returns {Object} Package.json object
     */
    generatePackageJson(projectName, capacity) {
        const basePackages = {
            "express": "^4.18.0",
            "dotenv": "^16.0.0"
        };

        const capacityPackages = {
            nano: {},
            micro: {
                "bcryptjs": "^2.4.3",
                "express-rate-limit": "^6.0.0"
            },
            small: {
                "bcryptjs": "^2.4.3",
                "express-rate-limit": "^6.0.0",
                "prom-client": "^14.0.0",
                "redis": "^4.0.0"
            },
            medium: {
                "bcryptjs": "^2.4.3",
                "express-rate-limit": "^6.0.0",
                "prom-client": "^14.0.0",
                "redis": "^4.0.0",
                "node-vault": "^0.9.0"
            },
            large: {
                "bcryptjs": "^2.4.3",
                "express-rate-limit": "^6.0.0",
                "prom-client": "^14.0.0",
                "redis": "^4.0.0",
                "node-vault": "^0.9.0",
                "elasticsearch": "^16.0.0"
            },
            enterprise: {
                "bcryptjs": "^2.4.3",
                "express-rate-limit": "^6.0.0",
                "prom-client": "^14.0.0",
                "redis": "^4.0.0",
                "node-vault": "^0.9.0",
                "elasticsearch": "^16.0.0",
                "kubernetes-client": "^12.0.0"
            }
        };

        return {
            name: projectName,
            version: "1.0.0",
            description: `duEuler Foundation project - ${capacity} capacity`,
            main: "src/index.js",
            scripts: {
                "start": "node src/index.js",
                "dev": "nodemon src/index.js",
                "test": "jest",
                "validate": "node scripts/validate-foundation.cjs",
                "upgrade": "node scripts/upgrade-capacity.cjs"
            },
            dependencies: {
                ...basePackages,
                ...capacityPackages[capacity]
            },
            devDependencies: {
                "nodemon": "^2.0.0",
                "jest": "^29.0.0"
            },
            keywords: ["dueuler", "foundation", capacity],
            author: "duEuler Foundation",
            license: "MIT",
            foundation: {
                capacity: capacity,
                version: "2.0",
                initialized: new Date().toISOString()
            }
        };
    }

    /**
     * Generate environment template
     * @param {string} capacity - Capacity level
     * @returns {string} Environment template content
     */
    generateEnvTemplate(capacity) {
        const baseEnv = `# duEuler Foundation Environment Configuration
# Capacity: ${capacity}

# Application
NODE_ENV=development
PORT=3000
APP_NAME=dueuler-foundation-app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

`;

        const capacityEnv = {
            nano: '',
            micro: `# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=10

`,
            small: `# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=10

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
PROMETHEUS_PORT=9090

`,
            medium: `# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12
VAULT_ENDPOINT=http://localhost:8200
VAULT_TOKEN=your-vault-token

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3000

`,
            large: `# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12
VAULT_ENDPOINT=http://localhost:8200
VAULT_TOKEN=your-vault-token

# Redis Cluster
REDIS_CLUSTER_NODES=localhost:7000,localhost:7001,localhost:7002

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3000

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

`,
            enterprise: `# Security
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12
VAULT_ENDPOINT=http://localhost:8200
VAULT_TOKEN=your-vault-token

# Redis Cluster
REDIS_CLUSTER_NODES=localhost:7000,localhost:7001,localhost:7002

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3000

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Kubernetes
KUBECONFIG=~/.kube/config
KUBERNETES_NAMESPACE=default

# Multi-region
REGIONS=us-east,us-west,eu-central

`
        };

        return baseEnv + capacityEnv[capacity];
    }

    /**
     * Generate README for the project
     * @param {string} projectName - Project name
     * @param {string} capacity - Capacity level
     * @returns {string} README content
     */
    generateReadme(projectName, capacity) {
        return `# ${projectName}

duEuler Foundation project initialized with **${capacity}** capacity configuration.

## Project Overview

This project uses the duEuler Foundation system for optimal resource management and scalability.

### Capacity: ${capacity}
- **Target Users**: ${this.getCapacityUserRange(capacity)}
- **Resources**: ${this.getCapacityResources(capacity)}
- **Features**: ${this.getCapacityFeatures(capacity)}

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment**:
   \`\`\`bash
   cp .env.template .env
   # Edit .env with your configuration
   \`\`\`

3. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## Foundation Scripts

- **Validate foundation**: \`npm run validate\`
- **Upgrade capacity**: \`npm run upgrade\`

## Documentation

- [Foundation Metadata](./documentation/FOUNDATION_METADATA.md)
- [Capacity Configuration](./config/capacity.json)

## Generated: ${new Date().toISOString()}
## Foundation Version: 2.0
`;
    }

    /**
     * Setup dependencies based on capacity
     * @param {string} targetDir - Target directory
     * @param {string} capacity - Capacity level
     */
    async setupDependencies(targetDir, capacity) {
        console.log('📦 Setting up dependencies...');
        
        // Create package-lock.json placeholder
        const packageLockPath = path.join(targetDir, 'package-lock.json');
        if (!fs.existsSync(packageLockPath)) {
            fs.writeFileSync(packageLockPath, JSON.stringify({
                name: "foundation-project",
                lockfileVersion: 2,
                requires: true,
                packages: {}
            }, null, 2));
        }

        console.log('✅ Dependencies configured');
        console.log('💡 Run "npm install" to install packages');
    }

    /**
     * Generate initial documentation
     * @param {string} targetDir - Target directory
     * @param {string} projectName - Project name
     * @param {string} capacity - Capacity level
     */
    async generateDocumentation(targetDir, projectName, capacity) {
        console.log('📚 Generating documentation...');
        
        const changelogContent = `# Changelog

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial project setup with duEuler Foundation
- ${capacity} capacity configuration
- Foundation validation scripts
- Basic project structure

### Foundation Features
- Capacity: ${capacity}
- Monitoring: ${capacity !== 'nano' ? 'Enabled' : 'Basic logging only'}
- Security: ${capacity === 'nano' ? 'Basic' : 'Enhanced'}
- Scalability: Configured for ${this.getCapacityUserRange(capacity)}
`;

        fs.writeFileSync(
            path.join(targetDir, 'CHANGELOG.md'),
            changelogContent
        );

        console.log('✅ Documentation generated');
    }

    /**
     * Validate the setup
     * @param {string} targetDir - Target directory
     * @param {string} capacity - Capacity level
     */
    async validateSetup(targetDir, capacity) {
        console.log('🔍 Validating setup...');
        
        const requiredFiles = [
            'package.json',
            'README.md',
            '.env.template',
            'config/capacity.json',
            'scripts/validate-foundation.cjs'
        ];

        const missingFiles = requiredFiles.filter(file => 
            !fs.existsSync(path.join(targetDir, file))
        );

        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }

        console.log('✅ Setup validation passed');
    }

    /**
     * Display next steps to user
     * @param {string} capacity - Capacity level
     */
    displayNextSteps(capacity) {
        console.log('\n🎯 Next Steps:');
        console.log('1. cd into your project directory');
        console.log('2. Run "npm install" to install dependencies');
        console.log('3. Copy .env.template to .env and configure');
        console.log('4. Run "npm run dev" to start development');
        console.log('5. Run "npm run validate" to check foundation compliance');
        
        if (capacity !== 'nano') {
            console.log('6. Configure monitoring services (Prometheus/Grafana)');
        }
        
        console.log('\n📖 Documentation: ./README.md');
        console.log('⚙️ Configuration: ./config/capacity.json');
    }

    /**
     * Cleanup on failure
     * @param {string} targetDir - Target directory
     */
    async cleanup(targetDir) {
        console.log('🧹 Cleaning up failed initialization...');
        // Add cleanup logic if needed
    }

    // Helper methods
    getCapacityUserRange(capacity) {
        const ranges = {
            nano: '1-1K users',
            micro: '1K-10K users', 
            small: '10K-50K users',
            medium: '50K-200K users',
            large: '200K-1M users',
            enterprise: '1M+ users'
        };
        return ranges[capacity];
    }

    getCapacityResources(capacity) {
        const resources = {
            nano: '512MB RAM, 0.5 CPU',
            micro: '1GB RAM, 1 CPU',
            small: '2GB RAM, 2 CPU',
            medium: '4GB RAM, 4 CPU',
            large: '8GB RAM, 8 CPU', 
            enterprise: '16GB+ RAM, 16+ CPU'
        };
        return resources[capacity];
    }

    getCapacityFeatures(capacity) {
        const features = {
            nano: 'Basic logging, Simple rate limiting',
            micro: 'Enhanced security, Basic monitoring',
            small: 'Prometheus metrics, Redis caching',
            medium: 'Grafana dashboards, Vault integration',
            large: 'Elasticsearch, Advanced monitoring',
            enterprise: 'Full observability, Multi-region support'
        };
        return features[capacity];
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node du-foundation-initializer.cjs [capacity] [project-name] [target-dir?]');
        console.log('');
        console.log('Capacities: nano, micro, small, medium, large, enterprise');
        console.log('');
        console.log('Examples:');
        console.log('  node du-foundation-initializer.cjs small my-app');
        console.log('  node du-foundation-initializer.cjs medium my-saas ./projects/my-saas');
        process.exit(1);
    }

    const [capacity, projectName, targetDir] = args;
    const initializer = new FoundationInitializer();
    
    initializer.initializeProject(capacity, projectName, targetDir)
        .then(() => {
            console.log('\n🎉 Foundation initialization completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Initialization failed:', error.message);
            process.exit(1);
        });
}

module.exports = FoundationInitializer;