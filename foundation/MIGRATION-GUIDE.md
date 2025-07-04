# Foundation v3.0 - Guia de Migração de Projetos Existentes

## 🔧 Migração Assistida para Projetos Existentes

Este guia cobre a migração de projetos existentes para compatibilidade com Foundation v3.0, baseado nos problemas reais identificados durante desenvolvimento.

## 🎯 Cenários de Migração

### **1. Projeto CommonJS → ES Modules**
O mais comum: projetos usando `require()` que precisam migrar para `import/export`.

### **2. Estrutura de Servidor Inadequada**
Projetos sem função `registerRoutes` ou estrutura Express inconsistente.

### **3. Dependências Faltando**
Projetos sem TypeScript ou Express configurados adequadamente.

## 🔍 Diagnóstico Inicial

Antes de migrar, execute sempre o scanner:

```bash
node foundation/foundation-scanner.cjs
```

### **Resultados Possíveis:**

#### 🟢 **COMPATÍVEL (80-100 pontos)**
```
✅ Projeto pronto para Foundation
🚀 Executar: foundation-installer para instalação
```
**Ação:** Proceder diretamente à instalação.

#### 🟡 **PRECISA_AJUSTES (40-79 pontos)**
```
🔧 Executar: foundation-migrator para ajustes automáticos
📖 Consultar: MIGRATION-GUIDE.md para ajustes manuais
```
**Ação:** Executar migrator + ajustes manuais.

#### 🔴 **INCOMPATÍVEL (0-39 pontos)**
```
❌ Projeto requer modificações significativas
📖 Consultar: NEW-PROJECT-GUIDE.md para projetos novos
```
**Ação:** Reestruturação completa necessária.

## 🛠️ Migração Automática

Para projetos **PRECISA_AJUSTES**, execute:

```bash
node foundation/foundation-migrator.cjs
```

### **O Migrator Automático Faz:**

1. **Migração ES Modules:**
   - Adiciona `"type": "module"` ao package.json
   - Converte `require()` → `import`
   - Converte `module.exports` → `export`

2. **Estrutura de Projeto:**
   - Cria pastas `server/`, `client/`, `shared/`
   - Gera arquivos base se não existirem

3. **Configuração do Servidor:**
   - Cria `server/index.ts` básico
   - Cria `server/routes.ts` com função `registerRoutes`

4. **Dependências:**
   - Adiciona Express e TypeScript ao package.json
   - Gera `tsconfig.json` padrão

5. **Backup Automático:**
   - Todos os arquivos originais salvos em `foundation/.migration-backup`

## 📝 Ajustes Manuais Comuns

Após migração automática, você pode precisar:

### **1. Ajustar Imports Específicos**

**Antes (CommonJS):**
```javascript
const express = require('express');
const { someFunction } = require('./utils');
```

**Depois (ES Modules):**
```typescript
import express from 'express';
import { someFunction } from './utils.js';
```

**⚠️ Atenção:** ES modules requer extensão `.js` nos imports locais.

### **2. Atualizar Exports Complexos**

**Antes:**
```javascript
module.exports = {
  handler: async (req, res) => {},
  middleware: (req, res, next) => {}
};
```

**Depois:**
```typescript
export const handler = async (req, res) => {};
export const middleware = (req, res, next) => {};
```

### **3. Configurar __dirname para ES Modules**

**Antes (CommonJS):**
```javascript
const path = require('path');
const filePath = path.join(__dirname, 'file.txt');
```

**Depois (ES Modules):**
```typescript
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, 'file.txt');
```

### **4. Integrar Sistema de Rotas**

Se seu projeto tem rotas personalizadas, integre-as na função `registerRoutes`:

```typescript
// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { myCustomRoutes } from "./my-routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Suas rotas existentes
  app.use('/api', myCustomRoutes);
  
  // Rota de health check obrigatória
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

## 🚨 Problemas Comuns e Soluções

### **Problema 1: "Cannot use import statement outside a module"**

**Causa:** package.json sem `"type": "module"`

**Solução:**
```json
{
  "type": "module"
}
```

### **Problema 2: "Module not found"**

**Causa:** Imports sem extensão `.js`

**Solução:**
```typescript
// ❌ Errado
import { utils } from './utils';

// ✅ Correto
import { utils } from './utils.js';
```

### **Problema 3: "registerRoutes is not a function"**

**Causa:** server/routes.ts não exporta função registerRoutes

**Solução:**
```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // suas rotas aqui
  const httpServer = createServer(app);
  return httpServer;
}
```

### **Problema 4: "__dirname is not defined"**

**Causa:** ES modules não tem __dirname global

**Solução:** Usar import.meta.url (ver exemplo acima)

## 🧪 Validação Pós-Migração

Após ajustes manuais:

```bash
# 1. Testar se servidor inicia
npm run dev

# 2. Verificar compatibilidade
node foundation/foundation-scanner.cjs

# 3. Se compatível, instalar Foundation
node foundation/foundation-installer.cjs
```

## 📊 Casos Especiais

### **Next.js Projects**
```json
{
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "foundation:dev": "tsx server/index.ts"
  }
}
```

### **Projetos com Database Migrations**
```typescript
// Manter migrations em CommonJS se necessário
// Criar scripts separados para Foundation
```

### **Projetos com Webpack Custom**
```javascript
// webpack.config.js pode ficar CommonJS
// Apenas server/ precisa ser ES modules
```

## 🔄 Rollback de Migração

Se algo der errado:

```bash
# Restaurar arquivos originais
cp foundation/.migration-backup/* ./

# Remover mudanças no package.json
git checkout package.json

# Ou usar git para reverter
git reset --hard HEAD~1
```

## ⚡ Script de Migração Rápida

Para acelerar migração de múltiplos projetos:

```bash
#!/bin/bash
# quick-migrate.sh

echo "🔍 Executando diagnóstico..."
node foundation/foundation-scanner.cjs

echo "🔧 Executando migração automática..."
node foundation/foundation-migrator.cjs

echo "🧪 Verificando resultado..."
node foundation/foundation-scanner.cjs

echo "✅ Migração concluída!"
```

## 📚 Recursos Adicionais

- **Backup automático:** `foundation/.migration-backup`
- **Relatórios:** `foundation/migration-report.json`
- **Troubleshooting:** `foundation/TROUBLESHOOTING.md`
- **Architecture:** `foundation/FOUNDATION-ARCHITECTURE.md`

## 🎯 Próximos Passos

1. **Scanner** → Diagnóstico completo
2. **Migrator** → Ajustes automáticos  
3. **Manual** → Correções específicas
4. **Validação** → Scanner novamente
5. **Instalação** → Foundation installer
6. **Teste** → http://localhost:5000/foundation/setup

---

**Criado em:** 2025-07-04  
**Versão:** 3.0.0  
**Para:** Migração de projetos existentes para Foundation