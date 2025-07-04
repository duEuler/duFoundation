# duEuler Foundation - Template System Guide

## Overview

Complete template and configuration system for automated project setup with capacity-specific dependencies and configurations.

## System Components

### 1. Package.json Templates (5 Tiers)

| Template | Capacity | Dependencies | APIs | Features |
|----------|----------|--------------|------|----------|
| `package.json.template` | NANO | 26 | 11 | Basic auth, routing |
| `package.json.micro.template` | MICRO | 58 | 32 | Redis, queue, search, notifications |
| `package.json.small.template` | SMALL | 68 | 41 | Load balancer, scaling, WebSocket |
| `package.json.large.template` | LARGE | 95 | 49 | Kubernetes, CDN, ML Ops |
| `package.json.enterprise.template` | ENTERPRISE | 162 | 69 | Service mesh, governance, MLOps |

### 2. Configuration Templates

#### Core Configuration Files
- `replit.md.template` - Project documentation with capacity-specific sections
- `tsconfig.json.template` - TypeScript configuration
- `vite.config.ts.template` - Vite build configuration with optimizations
- `tailwind.config.ts.template` - Tailwind CSS with design system
- `components.json.template` - ShadCN/UI component configuration
- `drizzle.config.ts.template` - Database ORM configuration
- `postcss.config.js.template` - PostCSS processing configuration
- `vitest.config.ts.template` - Testing framework configuration
- `i18next-parser.config.js.template` - Internationalization parser setup
- `.env.template` - Environment variables template

#### Docker Compose Templates (Capacity-Specific)

| Template | Capacity | Architecture | Services |
|----------|----------|--------------|----------|
| `docker-compose.yml.nano.template` | NANO (1-1K) | Single app + backup | App, backup (weekly) |
| `docker-compose.yml.micro.template` | MICRO (1K-10K) | App + cache + queue | App, PostgreSQL, Redis, Queue Worker, Analytics |
| `docker-compose.yml.small.template` | SMALL (10K-50K) | Load balanced + HA | 2x App instances, Nginx LB, Redis Cluster, Search, WebSocket |
| `docker-compose.yml.large.template` | LARGE (100K-1M) | Microservices + ML | API Gateway, Cost Monitor, ML Service, Consul, MinIO CDN |
| `docker-compose.yml.enterprise.template` | ENTERPRISE (1M+) | Full enterprise stack | Service mesh, MLOps, global LB, data governance |

### 3. Automation Scripts

#### foundation-setup.cjs (Master Script)
Complete project configuration in single command:
```bash
node foundation/foundation-installer.cjs --capacity enterprise --name "MyProject"
```

**Features:**
- Automatic capacity detection
- Template application with placeholders
- Directory structure creation
- Dependency installation
- Validation and reporting

#### install-dependencies.cjs
Capacity-specific dependency management:
```bash
node dueuler-foundation/automation/install-dependencies.cjs --capacity large
```

**Features:**
- Smart dependency merging
- Version conflict resolution
- Installation validation
- Performance reporting

#### setup-replit-md.cjs
Dynamic documentation configuration:
```bash
node dueuler-foundation/automation/setup-replit-md.cjs --apply-existing
```

**Features:**
- Capacity-based content sections
- User preference preservation
- Automatic updates
- Context maintenance

## Usage Instructions

### Quick Setup (Recommended)
```bash
# Complete setup for enterprise capacity
node dueuler-foundation/automation/foundation-setup.cjs \
  --capacity enterprise \
  --name "MyEnterprisePlatform" \
  --description "Advanced enterprise platform"

# Verify installation
npm run foundation:validate
```

### Manual Setup
```bash
# 1. Setup package.json
node dueuler-foundation/automation/install-dependencies.cjs --capacity micro

# 2. Configure documentation
node dueuler-foundation/automation/setup-replit-md.cjs --capacity micro

# 3. Apply configuration templates
node dueuler-foundation/automation/foundation-setup.cjs --skip-deps --capacity micro
```

### Capacity Migration
```bash
# Upgrade from micro to enterprise
node dueuler-foundation/automation/foundation-setup.cjs \
  --capacity enterprise \
  --name "ExistingProject"
```

## Template Placeholders

All templates support dynamic placeholder replacement:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project identifier | "dueuler-platform" |
| `{{PROJECT_DESCRIPTION}}` | Project description | "Enterprise platform" |
| `{{CAPACITY}}` | Target capacity tier | "enterprise" |
| `{{INIT_DATE}}` | Setup timestamp | "2025-06-29T03:44:00.000Z" |

## Capacity-Specific Features

### NANO (26 dependencies)
- Basic Express server
- Simple React frontend
- PostgreSQL with Drizzle
- JWT authentication
- Basic routing

### MICRO (58 dependencies)
**Added:** Redis cache, Bull queues, search service, push notifications, session management, Prometheus monitoring

### SMALL (68 dependencies)
**Added:** Load balancer, auto-scaling, WebSocket, advanced security, API gateway, A/B testing

### LARGE (95 dependencies)
**Added:** Kubernetes orchestration, service discovery, ML Ops, global CDN, zero-trust security, real-time analytics, multi-tenant architecture

### ENTERPRISE (162 dependencies)
**Added:** Kubernetes native, service mesh policies, global load balancing, data governance, complete MLOps pipelines

## Validation and Reports

### Setup Validation
```bash
# Validate complete setup
node dueuler-foundation/automation/foundation-setup.cjs --capacity enterprise
# Check: dueuler-foundation/logs/setup-report.json
```

### Dependency Validation
```bash
# Validate dependencies
node dueuler-foundation/automation/install-dependencies.cjs --capacity micro
# Check: dueuler-foundation/logs/installation-report.json
```

### Health Checks
```bash
# Run capacity-specific tests
npm run test:enterprise
npm run test:large
npm run test:small
npm run test:micro
npm run test:urgent
```

## Troubleshooting

### Common Issues

1. **Missing Templates**
   ```bash
   Error: Template not found: package.json.enterprise.template
   Solution: Ensure dueuler-foundation/templates/ directory exists
   ```

2. **Dependency Conflicts**
   ```bash
   Error: Version conflict detected
   Solution: Use --force flag or manual resolution
   ```

3. **Capacity Detection**
   ```bash
   Error: Could not detect capacity
   Solution: Use --capacity flag explicitly
   ```

### Debug Mode
```bash
# Verbose output for troubleshooting
node dueuler-foundation/automation/foundation-setup.cjs \
  --capacity enterprise \
  --verbose
```

## Integration with Existing Projects

### Retrofit Existing Project
```bash
# Backup existing files
cp package.json package.json.backup

# Apply foundation templates
node dueuler-foundation/automation/foundation-setup.cjs \
  --capacity large \
  --name "ExistingProject"

# Merge configurations manually if needed
```

### Preserve Custom Configurations
The system preserves:
- Existing scripts in package.json
- Custom dependencies
- User preferences in replit.md
- Environment-specific configurations

## Performance Metrics

| Capacity | Setup Time | Dependencies | Build Time | Memory Usage |
|----------|------------|--------------|------------|--------------|
| NANO | ~30s | 26 | ~20s | ~128MB |
| MICRO | ~45s | 58 | ~35s | ~256MB |
| SMALL | ~60s | 68 | ~45s | ~512MB |
| LARGE | ~90s | 95 | ~60s | ~1GB |
| ENTERPRISE | ~120s | 162 | ~90s | ~2GB |

## Future Enhancements

1. **Dynamic Template Generation** - AI-generated templates based on project requirements
2. **Cloud Integration** - Direct deployment configuration for AWS, GCP, Azure
3. **Monitoring Integration** - Automatic setup of observability stack
4. **Security Scanning** - Automated vulnerability assessment
5. **Performance Optimization** - Capacity-specific performance tuning

## Support

For issues or questions:
1. Check setup reports in `dueuler-foundation/logs/`
2. Run validation scripts
3. Review template configurations
4. Contact support with error logs and capacity information

---

**Version:** 3.0  
**Last Updated:** June 29, 2025  
**Compatibility:** All capacity tiers (NANO → ENTERPRISE)