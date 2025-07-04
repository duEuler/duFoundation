# Estratégia Foundation Nativo - duFundation v3.1

<!-- Tags: strategy, native, new-projects, integration, setup -->
<!-- Dependencies: Node.js 18+, PostgreSQL, Git -->
<!-- Related: ../microservice/README.md, ../../docs/guides/quick-start.md -->
<!-- Updated: 2025-07-04 -->

## 🎯 **Para Projetos Novos**

Esta estratégia é ideal para projetos que serão criados do zero, permitindo máximo aproveitamento dos recursos duFundation desde o primeiro commit.

## 🏗️ **Estrutura Gerada**

```
projeto-novo/
├── duFundation/          # Sistema duFundation integrado
│   ├── dashboard/       # Dashboard nativo (porta principal)
│   ├── configs/         # Configurações automáticas
│   └── core/            # Scripts de manutenção
├── server/              # Backend otimizado para duFundation
│   ├── index.ts         # Servidor principal
│   ├── routes.ts        # Rotas integradas
│   ├── db.ts           # Conexão database
│   └── storage.ts      # Camada de dados
├── client/              # Frontend otimizado
│   └── src/
│       ├── App.tsx     # App principal
│       ├── pages/      # Páginas da aplicação
│       └── components/ # Componentes customizados
├── shared/              # Tipos e schemas compartilhados
│   └── schema.ts       # Database schema
└── package.json        # Dependências consolidadas
```

## 🚀 **Comandos de Criação**

```bash
# Criar projeto Foundation nativo
dufundation create my-app --strategy=native --capacity=small

# Opções avançadas
dufundation create my-app \
  --strategy=native \
  --capacity=medium \
  --database=postgresql \
  --auth=session \
  --monitoring=enabled
```

## ⚙️ **Configurações Automáticas**

### **Package.json Gerado:**
```json
{
  "name": "projeto-dufundation",
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push:pg"
  },
  "dependencies": {
    "express": "^4.18.0",
    "react": "^18.0.0",
    "drizzle-orm": "^0.28.0",
    "@neondatabase/serverless": "^0.4.0"
  }
}
```

### **Server/index.ts Gerado:**
```typescript
import express from 'express';
import { registerRoutes } from './routes.js';
import { setupVite } from './vite.js';

const app = express();
const server = await registerRoutes(app);

// Integração nativa duFundation Dashboard
app.use('/dashboard', express.static('../duFundation/dashboard/dist'));

if (process.env.NODE_ENV === 'development') {
  await setupVite(app, server);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});
```

## 🎯 **Benefícios da Estratégia Nativo**

### **1. Integração Total:**
- ✅ Dashboard acessível via `/dashboard`
- ✅ APIs duFundation em `/api/foundation/*`
- ✅ Monitoramento nativo integrado
- ✅ Configuração automática por capacidade

### **2. Performance Otimizada:**
- ✅ Single process (app + dashboard)
- ✅ Shared database connection
- ✅ Unified session management
- ✅ Build process otimizado

### **3. Developer Experience:**
- ✅ Setup em < 2 minutos
- ✅ Hot reload completo
- ✅ Debug unificado
- ✅ Deploy single-step

## 📋 **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- PostgreSQL (local ou Neon)
- Git

## 🔧 **Configuração de Capacidade**

### **Small (Padrão):**
```bash
dufundation create my-app --capacity=small
# 50K-100K usuários, 2GB RAM, 2 cores
```

### **Medium:**
```bash
dufundation create my-app --capacity=medium
# 100K-500K usuários, 4GB RAM, 4 cores
```

### **Large:**
```bash
dufundation create my-app --capacity=large
# 500K-1M usuários, 8GB RAM, 8 cores
```

## 🚀 **Pós-Instalação**

Após criar o projeto:

```bash
cd my-app

# 1. Configure variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL

# 2. Execute migrations
npm run db:push

# 3. Inicie o servidor
npm run dev

# 4. Acesse o dashboard
# http://localhost:5000/dashboard
# Credenciais: admin/admin123
```

## 📊 **Monitoramento Integrado**

O projeto nativo inclui:

- **Métricas em Tempo Real:** CPU, Memória, Conexões
- **Dashboard Analytics:** Usuários ativos, Requests/min
- **Health Checks:** Database, APIs, Services
- **Error Tracking:** Logs centralizados
- **Performance:** Response times, Throughput

## 📚 **Documentação Relacionada**

- **[Configurações de Capacidade](../../docs/references/capacity-configs.md)** - Especificações técnicas
- **[API Reference](../../docs/references/api-reference.md)** - Endpoints disponíveis
- **[Deploy Guide](../../docs/guides/deployment.md)** - Processo de deployment
- **[Troubleshooting](../../docs/guides/troubleshooting.md)** - Solução de problemas

---

**Estratégia:** Foundation Nativo | **Versão:** 3.1.0 | **Status:** ✅ Production Ready