# Sistema de Templates - duFundation v3.1

<!-- Tags: templates, automation, configuration, capacity-based, docker -->
<!-- Dependencies: core/templates/, Node.js 18+, chosen capacity -->
<!-- Related: advanced-features.md, capacity-configs.md, quick-start.md -->
<!-- Updated: 2025-07-04 -->

## 📋 **Sistema de Templates Inteligente**

O duFundation v3.1 inclui **20+ templates especializados** que se adaptam automaticamente à capacidade escolhida, gerando configurações otimizadas para cada tier.

---

## 🏗️ **Templates Disponíveis**

### **1. Package.json por Capacidade**

Cada capacidade possui dependências otimizadas:

```
core/templates/
├── package.json.template           # Base comum
├── package.json.nano.template      # Dependências mínimas (MVP)
├── package.json.micro.template     # Startups (Redis básico)
├── package.json.small.template     # Pequenas empresas (Auto-scaling)
├── package.json.large.template     # Grandes empresas (Microserviços)
└── package.json.enterprise.template # Enterprise (Compliance)
```

**Exemplo - Nano vs Enterprise:**

```json
// package.json.nano.template (Mínimo)
{
  "dependencies": {
    "express": "^4.18.0",
    "drizzle-orm": "^0.29.0",
    "react": "^18.2.0"
  }
}

// package.json.enterprise.template (Completo)
{
  "dependencies": {
    "express": "^4.18.0",
    "drizzle-orm": "^0.29.0", 
    "react": "^18.2.0",
    "redis": "^4.6.0",
    "prometheus-client": "^14.2.0",
    "helmet": "^7.1.0",
    "rate-limiter-flexible": "^3.0.0",
    "winston": "^3.11.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "@sentry/node": "^7.75.0"
  }
}
```

### **2. Docker Compose por Tier**

Configurações Docker otimizadas para cada capacidade:

```
core/templates/
├── docker-compose.yml.nano.template        # Single container
├── docker-compose.yml.micro.template       # App + Redis
├── docker-compose.yml.small.template       # Load balancer básico
├── docker-compose.yml.large.template       # Microserviços
└── docker-compose.yml.enterprise.template  # Service mesh
```

**Exemplo - Large Capacity:**

```yaml
# docker-compose.yml.large.template
version: '3.8'
services:
  app:
    image: node:18-alpine
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 8G
          cpus: '8'
        reservations:
          memory: 4G
          cpus: '4'
    
  redis-cluster:
    image: redis/redis-stack:latest
    deploy:
      replicas: 3
    environment:
      - REDIS_ARGS=--cluster-enabled yes
    
  load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    configs:
      - nginx.conf
    
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### **3. Configurações de Build**

Templates para ferramentas de desenvolvimento:

```
core/templates/
├── vite.config.ts.template          # Build system
├── vitest.config.ts.template        # Testing framework
├── tailwind.config.ts.template      # CSS framework
├── tsconfig.json.template           # TypeScript
├── drizzle.config.ts.template       # Database ORM
└── postcss.config.js.template       # CSS processing
```

### **4. Configurações Especializadas**

```
core/templates/
├── components.json.template         # shadcn/ui
├── i18next-parser.config.js.template # Internacionalização
└── replit.md.template               # Documentação automática
```

---

## ⚙️ **Como o Sistema Funciona**

### **1. Seleção Automática de Templates**

```bash
# Durante criação de projeto
./dufundation create my-app --capacity=medium

# Sistema automaticamente:
# 1. Identifica capacidade = medium
# 2. Seleciona package.json.medium.template
# 3. Seleciona docker-compose.yml.medium.template  
# 4. Aplica configurações específicas do tier
```

### **2. Processamento de Templates**

```javascript
// Interno: core/installer/foundation-installer.cjs
function selectTemplate(capacity, templateType) {
  const templateFile = `${templateType}.${capacity}.template`;
  
  if (fs.existsSync(`core/templates/${templateFile}`)) {
    return templateFile; // Template específico da capacidade
  }
  
  return `${templateType}.template`; // Template base
}
```

### **3. Variáveis Dinâmicas**

Templates suportam variáveis que são substituídas automaticamente:

```json
// package.json.template
{
  "name": "{{PROJECT_NAME}}",
  "version": "{{VERSION}}",
  "description": "{{DESCRIPTION}}",
  "capacity": "{{CAPACITY}}",
  "resources": {
    "ram": "{{RAM_MB}}MB",
    "cpu": "{{CPU_CORES}} cores"
  }
}
```

**Variáveis Disponíveis:**
- `{{PROJECT_NAME}}` - Nome do projeto
- `{{CAPACITY}}` - Capacidade escolhida
- `{{RAM_MB}}` - RAM em MB
- `{{CPU_CORES}}` - Número de cores
- `{{MAX_USERS}}` - Usuários máximos
- `{{STRATEGY}}` - Estratégia (native/microservice/hybrid)
- `{{PORT}}` - Porta do serviço

---

## 📊 **Templates por Capacidade**

### **Nano (1K-10K usuários)**
```yaml
# Configuração mínima
services:
  app:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL={{DATABASE_URL}}
```

### **Micro (10K-50K usuários)**
```yaml
# App + Cache
services:
  app:
    image: node:18-alpine
    deploy:
      replicas: 1
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### **Small (50K-100K usuários)**
```yaml
# Load balancer básico
services:
  app:
    deploy:
      replicas: 2
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
  
  redis:
    image: redis:alpine
```

### **Medium (100K-500K usuários)**
```yaml
# Microserviços
services:
  api:
    deploy:
      replicas: 3
  
  dashboard:
    deploy:
      replicas: 2
  
  worker:
    deploy:
      replicas: 2
  
  redis-cluster:
    deploy:
      replicas: 3
```

### **Large (500K-1M usuários)**
```yaml
# Service mesh
services:
  app:
    deploy:
      replicas: 5
  
  istio-proxy:
    image: istio/proxyv2
  
  prometheus:
    image: prom/prometheus
  
  grafana:
    image: grafana/grafana
```

### **Enterprise (1M+ usuários)**
```yaml
# Compliance + Security
services:
  app:
    deploy:
      replicas: 10
      update_config:
        parallelism: 2
        delay: 10s
  
  waf:
    image: owasp/modsecurity
  
  vault:
    image: vault:latest
  
  falco:
    image: falcosecurity/falco
  
  elastic:
    image: elasticsearch:8.8.0
```

---

## 🔧 **Customização de Templates**

### **Adicionando Novos Templates**

```bash
# Criar template customizado
cp core/templates/package.json.template core/templates/package.json.custom.template

# Usar template customizado
./dufundation create my-app --capacity=custom --template-override=custom
```

### **Modificando Templates Existentes**

```bash
# Backup do template original
cp core/templates/docker-compose.yml.large.template \
   core/templates/docker-compose.yml.large.template.backup

# Editar template
vim core/templates/docker-compose.yml.large.template

# Aplicar mudanças
./dufundation upgrade --from=medium --to=large --force-update
```

### **Validação de Templates**

```bash
# Validar sintaxe de templates
./dufundation validate-templates

# Testar template específico
./dufundation test-template --capacity=enterprise --type=docker
```

---

## 📋 **Exemplos Práticos**

### **Criando Projeto com Template Específico**

```bash
# Projeto startup com Redis
./dufundation create startup-app \
  --capacity=micro \
  --strategy=native \
  --template=redis-enabled

# Projeto enterprise com compliance
./dufundation create corp-app \
  --capacity=enterprise \
  --strategy=hybrid \
  --template=sox-compliance
```

### **Verificando Templates Aplicados**

```bash
# Ver configuração atual
./dufundation config --show

# Output:
# Capacity: medium
# Templates Applied:
#   - package.json.medium.template
#   - docker-compose.yml.medium.template
#   - vite.config.ts.template
#   - tailwind.config.ts.template
```

---

## 🎯 **Benefícios do Sistema de Templates**

### **✅ Configuração Automática**
- Zero configuração manual necessária
- Templates otimizados para cada tier
- Variáveis dinâmicas preenchidas automaticamente

### **✅ Escalabilidade Progressiva**
- Upgrade automático entre capacidades
- Configurações crescem com o projeto
- Performance otimizada para cada escala

### **✅ Best Practices Integradas**
- Configurações enterprise por padrão
- Security hardening automático
- Monitoring e observability incluídos

### **✅ Manutenibilidade**
- Templates versionados
- Backup automático
- Rollback de configurações

**O sistema de templates garante que cada projeto duFundation seja otimizado desde o primeiro deploy até escala enterprise.**