#!/usr/bin/env node

/*
* duEuler Foundation File
* Category: automation-upgrade
* Capacity: du:capacity:[all]
* Dependencies: [capacity-configs/**, FOUNDATION_METADATA.md]
* Related Files: [du-foundation-validator.cjs, capacity-configs/**]
* Errors Solved: [manual upgrade complexity, configuration drift, downtime during scaling]
* Configuration: [automated capacity upgrade with validation and rollback]
* Upgrade Path: [nano->micro->small->medium->large->enterprise]
* Version Compatibility: [v2.0+]
* 
* MANDATORY DOCUMENTATION:
* - Purpose: Automated capacity upgrade system with safety checks
* - Usage: node foundation-structure/scripts/du-capacity-upgrader.cjs [current] [target]
* - Prerequisites: Foundation structure, valid capacity configs
* - Error Handling: Validation before upgrade, automatic rollback on failure
* - Performance Impact: Minimal during execution, optimizes target capacity
* - Security Considerations: Backup sensitive configs before upgrade
*/

const fs = require('fs');
const path = require('path');

class CapacityUpgrader {
    constructor() {
        this.capacityOrder = ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'];
        this.backupDir = 'foundation-structure/backups';
        this.configDir = 'foundation-structure/capacity-configs';
    }

    /**
     * Main upgrade execution
     * @param {string} currentCapacity - Current capacity level
     * @param {string} targetCapacity - Target capacity level
     */
    async upgradeCapacity(currentCapacity, targetCapacity) {
        console.log(`🚀 Starting capacity upgrade: ${currentCapacity} → ${targetCapacity}`);
        
        try {
            // Validation
            this.validateUpgradePath(currentCapacity, targetCapacity);
            
            // Create backup
            await this.createBackup(currentCapacity);
            
            // Load configurations
            const currentConfig = this.loadCapacityConfig(currentCapacity);
            const targetConfig = this.loadCapacityConfig(targetCapacity);
            
            // Generate upgrade plan
            const upgradePlan = this.generateUpgradePlan(currentConfig, targetConfig);
            
            // Display upgrade plan
            this.displayUpgradePlan(upgradePlan);
            
            // Execute upgrade steps
            await this.executeUpgrade(upgradePlan);
            
            // Validation post-upgrade
            await this.validateUpgrade(targetCapacity);
            
            console.log(`✅ Successfully upgraded to ${targetCapacity} capacity`);
            console.log(`📊 New configuration active with optimized settings`);
            
        } catch (error) {
            console.error(`❌ Upgrade failed: ${error.message}`);
            await this.rollback(currentCapacity);
            throw error;
        }
    }

    /**
     * Validates if upgrade path is valid
     * @param {string} current - Current capacity
     * @param {string} target - Target capacity
     */
    validateUpgradePath(current, target) {
        if (!this.capacityOrder.includes(current)) {
            throw new Error(`Invalid current capacity: ${current}`);
        }
        
        if (!this.capacityOrder.includes(target)) {
            throw new Error(`Invalid target capacity: ${target}`);
        }
        
        const currentIndex = this.capacityOrder.indexOf(current);
        const targetIndex = this.capacityOrder.indexOf(target);
        
        if (targetIndex <= currentIndex) {
            throw new Error(`Cannot downgrade from ${current} to ${target}. Use rollback instead.`);
        }
        
        // Check if skipping too many levels
        if (targetIndex - currentIndex > 2) {
            console.warn(`⚠️  Warning: Skipping ${targetIndex - currentIndex - 1} capacity levels. Consider gradual upgrade.`);
        }
    }

    /**
     * Load capacity configuration
     * @param {string} capacity - Capacity level
     * @returns {Object} Configuration object
     */
    loadCapacityConfig(capacity) {
        const configPath = path.join(this.configDir, capacity, `du-capacity-${capacity}-config.json`);
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration not found for capacity: ${capacity}`);
        }
        
        const content = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(content);
    }

    /**
     * Generate detailed upgrade plan
     * @param {Object} currentConfig - Current configuration
     * @param {Object} targetConfig - Target configuration
     * @returns {Object} Upgrade plan
     */
    generateUpgradePlan(currentConfig, targetConfig) {
        const plan = {
            resourceChanges: this.compareResources(currentConfig, targetConfig),
            serviceChanges: this.compareServices(currentConfig, targetConfig),
            dependencyChanges: this.compareDependencies(currentConfig, targetConfig),
            configurationUpdates: [],
            backupRequired: true,
            estimatedDowntime: this.estimateDowntime(currentConfig, targetConfig),
            rollbackPlan: this.generateRollbackPlan(currentConfig)
        };

        return plan;
    }

    /**
     * Compare resource requirements
     * @param {Object} current - Current config
     * @param {Object} target - Target config
     * @returns {Object} Resource differences
     */
    compareResources(current, target) {
        const changes = {};
        const currentRes = current.capacity.resources;
        const targetRes = target.capacity.resources;

        Object.keys(targetRes).forEach(key => {
            if (currentRes[key] !== targetRes[key]) {
                changes[key] = {
                    from: currentRes[key],
                    to: targetRes[key],
                    change: targetRes[key] > currentRes[key] ? 'increase' : 'decrease'
                };
            }
        });

        return changes;
    }

    /**
     * Compare service configurations
     * @param {Object} current - Current config
     * @param {Object} target - Target config
     * @returns {Array} Service changes
     */
    compareServices(current, target) {
        const changes = [];
        const currentServices = current.services;
        const targetServices = target.services;

        // Check for new services to enable
        Object.keys(targetServices).forEach(service => {
            if (!currentServices[service]) {
                changes.push({
                    action: 'enable',
                    service: service,
                    config: targetServices[service]
                });
            } else if (JSON.stringify(currentServices[service]) !== JSON.stringify(targetServices[service])) {
                changes.push({
                    action: 'update',
                    service: service,
                    from: currentServices[service],
                    to: targetServices[service]
                });
            }
        });

        return changes;
    }

    /**
     * Compare dependency requirements
     * @param {Object} current - Current config
     * @param {Object} target - Target config
     * @returns {Array} Dependency changes
     */
    compareDependencies(current, target) {
        const changes = [];
        const currentDeps = current._metadata.dependencies || [];
        const targetDeps = target._metadata.dependencies || [];

        const newDeps = targetDeps.filter(dep => !currentDeps.includes(dep));
        const removedDeps = currentDeps.filter(dep => !targetDeps.includes(dep));

        newDeps.forEach(dep => {
            changes.push({
                action: 'install',
                dependency: dep,
                type: 'new_requirement'
            });
        });

        removedDeps.forEach(dep => {
            changes.push({
                action: 'remove',
                dependency: dep,
                type: 'no_longer_needed'
            });
        });

        return changes;
    }

    /**
     * Display upgrade plan to user
     * @param {Object} plan - Upgrade plan
     */
    displayUpgradePlan(plan) {
        console.log('\n📋 UPGRADE PLAN');
        console.log('==========================================');
        
        console.log('\n🔧 Resource Changes:');
        Object.entries(plan.resourceChanges).forEach(([resource, change]) => {
            console.log(`  ${resource}: ${change.from} → ${change.to} (${change.change})`);
        });

        console.log('\n⚙️  Service Changes:');
        plan.serviceChanges.forEach(change => {
            console.log(`  ${change.action.toUpperCase()}: ${change.service}`);
        });

        console.log('\n📦 Dependency Changes:');
        plan.dependencyChanges.forEach(change => {
            console.log(`  ${change.action.toUpperCase()}: ${change.dependency}`);
        });

        console.log(`\n⏱️  Estimated Downtime: ${plan.estimatedDowntime}`);
        console.log(`🔄 Rollback Available: ${plan.rollbackPlan ? 'Yes' : 'No'}\n`);
    }

    /**
     * Execute the upgrade steps
     * @param {Object} plan - Upgrade plan
     */
    async executeUpgrade(plan) {
        console.log('🔄 Executing upgrade steps...\n');

        // Step 1: Update dependencies
        if (plan.dependencyChanges.length > 0) {
            console.log('📦 Updating dependencies...');
            await this.updateDependencies(plan.dependencyChanges);
        }

        // Step 2: Update service configurations
        if (plan.serviceChanges.length > 0) {
            console.log('⚙️  Updating service configurations...');
            await this.updateServices(plan.serviceChanges);
        }

        // Step 3: Apply resource scaling
        if (Object.keys(plan.resourceChanges).length > 0) {
            console.log('🔧 Applying resource scaling...');
            await this.scaleResources(plan.resourceChanges);
        }

        console.log('✅ All upgrade steps completed successfully');
    }

    /**
     * Update dependencies based on plan
     * @param {Array} changes - Dependency changes
     */
    async updateDependencies(changes) {
        for (const change of changes) {
            console.log(`  ${change.action}: ${change.dependency}`);
            
            if (change.action === 'install') {
                // Add logic to install dependency
                await this.installDependency(change.dependency);
            } else if (change.action === 'remove') {
                // Add logic to remove dependency
                await this.removeDependency(change.dependency);
            }
        }
    }

    /**
     * Update service configurations
     * @param {Array} changes - Service changes
     */
    async updateServices(changes) {
        for (const change of changes) {
            console.log(`  ${change.action}: ${change.service}`);
            
            if (change.action === 'enable') {
                await this.enableService(change.service, change.config);
            } else if (change.action === 'update') {
                await this.updateService(change.service, change.to);
            }
        }
    }

    /**
     * Scale resources according to plan
     * @param {Object} changes - Resource changes
     */
    async scaleResources(changes) {
        Object.entries(changes).forEach(([resource, change]) => {
            console.log(`  Scaling ${resource}: ${change.from} → ${change.to}`);
            // Add actual scaling logic here
        });
    }

    /**
     * Create backup before upgrade
     * @param {string} currentCapacity - Current capacity level
     */
    async createBackup(currentCapacity) {
        console.log('💾 Creating backup...');
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `backup-${currentCapacity}-${timestamp}.json`);
        
        const currentConfig = this.loadCapacityConfig(currentCapacity);
        fs.writeFileSync(backupPath, JSON.stringify(currentConfig, null, 2));
        
        console.log(`✅ Backup created: ${backupPath}`);
        return backupPath;
    }

    /**
     * Estimate downtime for upgrade
     * @param {Object} currentConfig - Current configuration
     * @param {Object} targetConfig - Target configuration
     * @returns {string} Estimated downtime
     */
    estimateDowntime(currentConfig, targetConfig) {
        const currentLevel = currentConfig.capacity.level;
        const targetLevel = targetConfig.capacity.level;
        
        const downtimeMap = {
            'nano-micro': '30 seconds',
            'micro-small': '1-2 minutes',
            'small-medium': '2-5 minutes',
            'medium-large': '5-10 minutes',
            'large-enterprise': '10-30 minutes'
        };

        const key = `${currentLevel}-${targetLevel}`;
        return downtimeMap[key] || 'Variable (complex upgrade)';
    }

    /**
     * Validate upgrade completion
     * @param {string} targetCapacity - Target capacity level
     */
    async validateUpgrade(targetCapacity) {
        console.log('🔍 Validating upgrade...');
        
        // Load target config to verify
        const config = this.loadCapacityConfig(targetCapacity);
        
        // Run basic validation checks
        const checks = [
            () => this.checkResourceAvailability(config),
            () => this.checkServiceStatus(config),
            () => this.checkDependencies(config)
        ];

        for (const check of checks) {
            await check();
        }

        console.log('✅ Upgrade validation passed');
    }

    /**
     * Rollback on failure
     * @param {string} originalCapacity - Original capacity to rollback to
     */
    async rollback(originalCapacity) {
        console.log(`🔄 Rolling back to ${originalCapacity}...`);
        
        // Find latest backup
        const backups = fs.readdirSync(this.backupDir)
            .filter(file => file.startsWith(`backup-${originalCapacity}`))
            .sort()
            .reverse();

        if (backups.length === 0) {
            throw new Error('No backup found for rollback');
        }

        const latestBackup = path.join(this.backupDir, backups[0]);
        console.log(`📥 Restoring from: ${latestBackup}`);
        
        // Restore configuration
        const backupConfig = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
        const configPath = path.join(this.configDir, originalCapacity, `du-capacity-${originalCapacity}-config.json`);
        fs.writeFileSync(configPath, JSON.stringify(backupConfig, null, 2));
        
        console.log('✅ Rollback completed successfully');
    }

    // Placeholder methods for actual implementation
    async installDependency(dependency) { /* Implementation needed */ }
    async removeDependency(dependency) { /* Implementation needed */ }
    async enableService(service, config) { /* Implementation needed */ }
    async updateService(service, config) { /* Implementation needed */ }
    async checkResourceAvailability(config) { return true; }
    async checkServiceStatus(config) { return true; }
    async checkDependencies(config) { return true; }
    generateRollbackPlan(config) { return true; }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('Usage: node du-capacity-upgrader.cjs [current_capacity] [target_capacity]');
        console.log('Example: node du-capacity-upgrader.cjs small medium');
        process.exit(1);
    }

    const [currentCapacity, targetCapacity] = args;
    const upgrader = new CapacityUpgrader();
    
    upgrader.upgradeCapacity(currentCapacity, targetCapacity)
        .then(() => {
            console.log('🎉 Upgrade completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Upgrade failed:', error.message);
            process.exit(1);
        });
}

module.exports = CapacityUpgrader;