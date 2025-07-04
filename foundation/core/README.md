<!-- REVISAR-DESATUALIZADO: Versão indicada como v2.0 mas sistema atual é v3.0 -->
# duEuler Foundation System v3.0

## Overview

The duEuler Foundation is a complete system for building scalable applications on Replit, featuring:

- **6 Capacity Levels**: nano → micro → small → medium → large → enterprise
- **Automatic Scaling**: Configuration-driven resource optimization
- **Built-in Monitoring**: Prometheus + Grafana integration
- **Security First**: Capacity-appropriate security measures
- **Documentation Enforced**: Mandatory documentation on all components

## Quick Start

### 1. Initialize New Project
```bash
node dueuler-foundation/automation/initializer.cjs small my-app
cd my-app
npm install
cp .env.template .env
npm run dev
```

### 2. Add to Existing Project
```bash
# Copy foundation structure
cp -r dueuler-foundation/ ./
# Choose your capacity and copy config
cp dueuler-foundation/configs/small/du-capacity-small-config.json ./config/capacity.json
# Install dependencies based on capacity
npm install express prom-client redis
```

### 3. Validate Setup
```bash
npm run validate
# or
node dueuler-foundation/automation/validator.cjs
```

## Capacity Selection Guide

| Capacity | Users | RAM | CPU | Use Case | Features |
|----------|-------|-----|-----|----------|-----------|
| **nano** | 1-1K | 512MB | 0.5 | Dentist, lawyer | Basic logging |
| **micro** | 1K-10K | 1GB | 1 | Small clinic | Enhanced security |
| **small** | 10K-50K | 2GB | 2 | Regional startup | Prometheus + Redis |
| **medium** | 50K-200K | 4GB | 4 | Growing SaaS | Grafana + Vault |
| **large** | 200K-1M | 8GB | 8 | Enterprise app | Elasticsearch + HA |
| **enterprise** | 1M+ | 16GB+ | 16+ | Global platform | Multi-region + Full compliance |

---

**Built with ❤️ by duEuler Foundation Team**

*Pragmatic scaling from 10K to 1M users without over-engineering*