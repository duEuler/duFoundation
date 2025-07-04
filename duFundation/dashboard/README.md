# duFundation Dashboard v3.1 - Aplicação de Gerenciamento Isolada

## 🔒 **REGRAS CRÍTICAS DE ISOLAMENTO ARQUITETURAL**

### 🚫 **VIOLAÇÕES PROIBIDAS - NUNCA FAÇA:**

1. **IMPORTS EXTERNOS PROIBIDOS:**
   ```tsx
   ❌ import { Card } from '@/components/ui/card';        // Quebra isolamento
   ❌ import { Button } from '@shared/components';        // Dependência externa
   ❌ import utils from '../../root/lib/utils';           // Acesso à raiz
   ```

2. **DEPENDÊNCIAS EXTERNAS PROIBIDAS:**
   - ❌ Usar package.json da aplicação raiz
   - ❌ Importar de node_modules externo
   - ❌ Referenciar arquivos fora de duFundation/dashboard/
   - ❌ Usar configurações externas (vite.config.ts, tailwind.config.ts)

### ✅ **PADRÕES CORRETOS DE ISOLAMENTO:**

1. **IMPORTS INTERNOS CORRETOS:**
   ```tsx
   ✅ import { Card } from '../ui/card';                  // Relativo interno
   ✅ import { Button } from './components/Button';       // Caminho local
   ✅ import { utils } from '../../lib/utils';            // Lib interna
   ✅ import schema from '@shared/schema';                // Shared interno
   ```

2. **ESTRUTURA INDEPENDENTE:**
   ```
   duFundation/dashboard/
   ├── package.json              ✅ Dependências próprias
   ├── node_modules/             ✅ Isolamento completo
   ├── vite.config.ts            ✅ Config independente
   ├── tsconfig.json             ✅ Paths internos
   ├── client/src/lib/utils.ts   ✅ Utilitários próprios
   ├── client/src/components/ui/ ✅ 47 componentes isolados
   └── shared/schema.ts          ✅ Schema próprio
   ```

## 🏗️ **ARQUITETURA DE ISOLAMENTO TOTAL**

### **PRINCÍPIO FUNDAMENTAL:**
> Esta aplicação Dashboard v3.1 deve funcionar **COMPLETAMENTE INDEPENDENTE** da aplicação hospedeira, sem nenhuma dependência externa, import cruzado ou violação de isolamento.

### **VALIDAÇÃO DE INTEGRIDADE:**
- ✅ **0 imports externos** (`@/` para arquivos da raiz)
- ✅ **47 componentes UI próprios** (shadcn/ui completo)
- ✅ **Package.json independente** com 79 dependências
- ✅ **Node_modules isolado** (7.384 arquivos próprios)
- ✅ **Database schema próprio** (Drizzle ORM)
- ✅ **Sistema build independente** (Vite + TypeScript)

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **Sistema de Autenticação:**
- ✅ Login/logout com sessões PostgreSQL
- ✅ Middleware de autenticação
- ✅ Proteção de rotas sensíveis
- ✅ Credenciais padrão: admin/admin123

### **Dashboard Enterprise:**
- ✅ Métricas em tempo real
- ✅ Monitoramento de recursos
- ✅ Atividade do sistema
- ✅ Configurações por capacidade

### **Wizard de Setup:**
- ✅ 6 etapas de configuração
- ✅ Validação completa
- ✅ Interface responsiva
- ✅ Seleção de capacidade automática

### **API Completa:**
- ✅ `/api/auth/*` - Autenticação
- ✅ `/api/system/*` - Status do sistema
- ✅ `/api/metrics/*` - Métricas em tempo real
- ✅ `/api/foundation/*` - Configuração Foundation

## 🚀 **COMANDOS DE DESENVOLVIMENTO**

```bash
# Navegue para o dashboard
cd duFundation/dashboard

# Instale dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute testes
npm run test
```

## 🔧 **CONFIGURAÇÃO DE PORTA**

O dashboard pode rodar em portas independentes:

```bash
# Porta padrão (3000)
npm run dev

# Porta customizada
PORT=3001 npm run dev

# Configuração para microserviço
PORT=3001 STRATEGY=microservice npm run dev
```

## 📊 **INTEGRAÇÃO COM duFundation**

### **Como Aplicação Isolada (Microserviço):**
```bash
# Roda independente na porta 3001
cd duFundation/dashboard && PORT=3001 npm run dev
```

### **Como Aplicação Integrada (Nativo):**
```bash
# Integrado às rotas principais do projeto
cd duFundation && npm run integrate:dashboard
```

## 🔍 **VALIDAÇÃO DE ISOLAMENTO**

Execute o script de validação para garantir isolamento total:

```bash
cd duFundation/dashboard
node validate-isolation.cjs
```

### **Relatório Esperado:**
```
✅ ISOLAMENTO VALIDADO
- 0 imports externos detectados
- 47 componentes UI internos
- Package.json independente
- Estrutura completamente isolada
```

## 📚 **DOCUMENTAÇÃO RELACIONADA**

- **[Configurações de Capacidade](../docs/references/capacity-configs.md)** - Especificações técnicas
- **[Estratégias de Integração](../docs/guides/implementation-strategies.md)** - Abordagens de uso
- **[API Reference](../docs/references/api-reference.md)** - Documentação das APIs
- **[Troubleshooting](../docs/guides/troubleshooting.md)** - Solução de problemas

---

**Status:** ✅ Completamente Isolado | **Versão:** 3.1.0 | **Atualizado:** July 4, 2025