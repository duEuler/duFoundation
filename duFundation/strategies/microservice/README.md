# Estratégia Foundation Microserviço - duFundation v3.1

## 🎯 **Para Projetos Existentes**

Esta estratégia permite integrar duFundation em projetos existentes **sem modificar o código atual**, rodando o dashboard como microserviço independente.

## 🏗️ **Estrutura de Integração**

```
projeto-existente/
├── src/                      # Código existente mantido
├── config/                   # Configurações existentes
├── package.json             # Dependencies originais
└── duFundation/             # Sistema isolado
    ├── dashboard/           # Microserviço na porta 3001
    │   ├── package.json     # Deps independentes
    │   └── node_modules/    # Isolamento total
    ├── configs/             # Configurações capacidade
    └── integration/         # Scripts de ponte
```

## 🚀 **Comandos de Integração**

```bash
# Integrar em projeto existente
cd meu-projeto-existente
dufundation integrate --strategy=microservice --port=3001

# Opções avançadas
dufundation integrate \
  --strategy=microservice \
  --port=3001 \
  --capacity=medium \
  --subdomain=dashboard \
  --proxy=nginx
```

## ⚙️ **Configuração Automática**

### **Processo de Integração:**

1. **Análise do Projeto Existente:**
   ```bash
   dufundation analyze ./
   # Detecta: framework, estrutura, dependencies
   ```

2. **Instalação Não-Invasiva:**
   ```bash
   # Cria duFundation/ sem tocar no código existente
   # Configura proxy reverso opcional
   # Setup de database independente
   ```

3. **Inicialização Dual:**
   ```bash
   # Terminal 1: Projeto original
   npm run dev  # localhost:3000
   
   # Terminal 2: Dashboard duFundation
   cd duFundation/dashboard && npm run dev  # localhost:3001
   ```

## 🔗 **Configuração de Proxy**

### **Nginx (Recomendado):**
```nginx
server {
    listen 80;
    server_name myapp.com;

    # Aplicação principal
    location / {
        proxy_pass http://localhost:3000;
    }

    # Dashboard duFundation
    location /dashboard {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Express Proxy (Alternativa):**
```javascript
// Adicione ao seu server existente
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/dashboard', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/dashboard': '' }
}));
```

## 🎯 **Benefícios da Estratégia Microserviço**

### **1. Zero Impacto no Código:**
- ✅ Nenhuma modificação no projeto atual
- ✅ Dependencies originais mantidas
- ✅ Build process inalterado
- ✅ Deploy independente

### **2. Isolamento Completo:**
- ✅ Processo separado (crash isolation)
- ✅ Database connection independente
- ✅ Memory footprint isolado
- ✅ Scaling independente

### **3. Flexibilidade:**
- ✅ Dashboard on/off conforme necessário
- ✅ Diferentes versões duFundation
- ✅ Multiple environments
- ✅ A/B testing friendly

## 📋 **Pré-requisitos**

- Projeto existente funcional
- Node.js 18+ disponível
- Porta adicional disponível (3001)
- PostgreSQL (pode compartilhar database)

## 🔧 **Configurações de Integração**

### **Shared Database:**
```bash
# Compartilha database com projeto principal
dufundation integrate \
  --strategy=microservice \
  --database-url=$MAIN_DATABASE_URL \
  --schema-prefix=dufundation_
```

### **Separate Database:**
```bash
# Database independente
dufundation integrate \
  --strategy=microservice \
  --database-url=$DUFUNDATION_DATABASE_URL
```

### **Custom Port:**
```bash
# Porta customizada
dufundation integrate \
  --strategy=microservice \
  --port=4000
```

## 🚀 **Pós-Integração**

Após integração:

```bash
# 1. Configure environment
cd duFundation/dashboard
cp .env.example .env
# Edite DATABASE_URL, PORT, etc.

# 2. Execute database setup
npm run db:push

# 3. Inicie dashboard microserviço
npm run dev

# 4. Configure proxy (opcional)
# Nginx, Apache, ou Express middleware

# 5. Acesse dashboard
# http://localhost:3001 (direto)
# http://localhost:3000/dashboard (via proxy)
```

## 📊 **Monitoramento Distribuído**

O dashboard microserviço monitora:

- **Próprio processo:** CPU, Memory, Health
- **Aplicação principal:** Via API calls
- **Database shared:** Queries, Performance
- **Network:** Latency entre serviços
- **Business metrics:** Importados via APIs

### **API Integration Example:**
```javascript
// No seu projeto principal, exponha métricas
app.get('/api/metrics', (req, res) => {
  res.json({
    activeUsers: await getUserCount(),
    requestsPerMinute: getRequestRate(),
    errorRate: getErrorRate(),
    uptime: process.uptime()
  });
});
```

## 🔄 **Estratégias de Deploy**

### **Docker Compose:**
```yaml
services:
  main-app:
    build: .
    ports:
      - "3000:3000"
  
  dufundation-dashboard:
    build: ./duFundation/dashboard
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MAIN_APP_URL=http://main-app:3000
```

### **PM2 Process Manager:**
```json
{
  "apps": [
    {
      "name": "main-app",
      "script": "npm run start",
      "cwd": "."
    },
    {
      "name": "dufundation-dashboard",
      "script": "npm run start",
      "cwd": "./duFundation/dashboard"
    }
  ]
}
```

## 📚 **Documentação Relacionada**

- **[Proxy Configuration](../../docs/guides/proxy-setup.md)** - Setup de proxy reverso
- **[Database Sharing](../../docs/guides/database-sharing.md)** - Compartilhamento de database
- **[API Integration](../../docs/references/api-integration.md)** - Integração via APIs
- **[Deployment Patterns](../../docs/guides/deployment.md)** - Padrões de deploy

---

**Estratégia:** Foundation Microserviço | **Versão:** 3.1.0 | **Status:** ✅ Production Ready