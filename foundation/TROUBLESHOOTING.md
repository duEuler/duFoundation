# Foundation v3.0 - Guia de Resolução de Problemas

## 🚨 Problemas Mais Comuns e Soluções

Este guia cobre todos os problemas identificados durante desenvolvimento e testes reais do Foundation v3.0.

## 🔍 Diagnóstico Rápido

Use sempre o scanner primeiro para diagnóstico:

```bash
node foundation/foundation-scanner.cjs
```

## 📋 Problemas por Categoria

### **1. Problemas de Módulos (ES/CommonJS)**

#### ❌ "Cannot use import statement outside a module"

**Sintomas:**
```
SyntaxError: Cannot use import statement outside a module
```

**Causa:** Projeto não configurado para ES modules

**Solução:**
```json
// package.json
{
  "type": "module"
}
```

**Verificação:**
```bash
grep '"type"' package.json
# Deve mostrar: "type": "module"
```

---

#### ❌ "Module not found" para imports locais

**Sintomas:**
```
Error: Cannot find module './utils'
```

**Causa:** ES modules requer extensão .js em imports locais

**Solução:**
```typescript
// ❌ Errado
import { utils } from './utils';

// ✅ Correto
import { utils } from './utils.js';
```

**Script de correção automática:**
```bash
# Encontrar todos os imports sem extensão
grep -r "from '\./[^']*'[^.]" server/ client/
```

---

#### ❌ "require is not defined"

**Sintomas:**
```
ReferenceError: require is not defined
```

**Causa:** Código CommonJS em projeto ES modules

**Solução automática:**
```bash
node foundation/foundation-migrator.cjs
```

**Solução manual:**
```typescript
// ❌ CommonJS
const express = require('express');

// ✅ ES Modules
import express from 'express';
```

### **2. Problemas de Rotas e Servidor**

#### ❌ "registerRoutes is not a function"

**Sintomas:**
```
TypeError: registerRoutes is not a function
```

**Causa:** server/routes.ts não exporta função registerRoutes

**Diagnóstico:**
```bash
grep "registerRoutes" server/routes.ts
```

**Solução:**
```typescript
// server/routes.ts
export async function registerRoutes(app: Express): Promise<Server> {
  // suas rotas aqui
  const httpServer = createServer(app);
  return httpServer;
}
```

---

#### ❌ Rota Foundation retorna 404

**Sintomas:**
```bash
curl http://localhost:5000/foundation/setup
# Retorna: Cannot GET /foundation/setup
```

**Diagnóstico:**
```bash
# Verificar se rota foi registrada
grep "foundationSetup" server/routes.ts
grep "app.use.*foundation" server/routes.ts
```

**Soluções possíveis:**

1. **Import faltando:**
```typescript
import foundationSetup from './routes/foundation-setup.js';
```

2. **Registro faltando:**
```typescript
app.use(foundationSetup);
```

3. **Arquivo não criado:**
```bash
ls server/routes/foundation-setup.js
# Se não existir, executar foundation-installer
```

---

#### ❌ "Cannot find module './routes/foundation-setup.js'"

**Sintomas:**
```
Error: Cannot find module './routes/foundation-setup.js'
```

**Diagnóstico:**
```bash
ls -la server/routes/
```

**Solução:**
```bash
# Re-executar installer
node foundation/foundation-installer.cjs
```

### **3. Problemas de TypeScript**

#### ❌ "__dirname is not defined"

**Sintomas:**
```
ReferenceError: __dirname is not defined
```

**Causa:** ES modules não tem __dirname global

**Solução:**
```typescript
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

#### ❌ Erros de tipo TypeScript

**Sintomas:**
```
Type 'Express' is not assignable to type 'Application'
```

**Diagnóstico:**
```bash
npm ls @types/express typescript
```

**Solução:**
```bash
npm install @types/express @types/node typescript
```

### **4. Problemas de Dependências**

#### ❌ "express is not defined"

**Sintomas:**
```
ReferenceError: express is not defined
```

**Diagnóstico:**
```bash
npm ls express
```

**Solução:**
```bash
npm install express @types/express
```

---

#### ❌ Versões incompatíveis

**Sintomas:**
Diversos erros estranhos de runtime

**Diagnóstico:**
```bash
npm outdated
npm audit
```

**Solução:**
```bash
npm update
npm audit fix
```

### **5. Problemas de Instalação Foundation**

#### ❌ "Foundation já está instalado"

**Sintomas:**
```
Foundation já está instalado. Use foundation-remove primeiro.
```

**Solução:**
```bash
# Remover instalação anterior
node foundation/foundation-remove.cjs

# Reinstalar
node foundation/foundation-installer.cjs
```

---

#### ❌ Validação funcional falha

**Sintomas:**
```
❌ Validação funcional falhou. Iniciando rollback...
```

**Diagnóstico:**
```bash
# Verificar logs do servidor
tail -f logs/server.log

# Testar rotas manualmente
curl http://localhost:5000/api/health
curl http://localhost:5000/foundation/setup
```

**Soluções:**

1. **Servidor não respondendo:**
```bash
# Verificar se processo está rodando
ps aux | grep node
netstat -tulpn | grep 5000
```

2. **Erro de sintaxe:**
```bash
# Verificar syntax
node --check server/index.ts
```

3. **Dependências faltando:**
```bash
npm install
```

### **6. Problemas de Scanner**

#### ❌ Scanner não executa

**Sintomas:**
```bash
node foundation/foundation-scanner.cjs
# Nenhuma saída
```

**Solução:**
```bash
# Verificar se arquivo existe
ls -la foundation/foundation-scanner.cjs

# Baixar novamente se necessário
curl -o foundation/foundation-scanner.cjs https://foundation.dueuler.com/scanner.cjs
```

---

#### ❌ "Project root not found"

**Sintomas:**
```
Error: Project root not found
```

**Solução:**
```bash
# Executar da raiz do projeto
cd /caminho/para/projeto
node foundation/foundation-scanner.cjs
```

## 🛠️ Scripts de Diagnóstico

### **Script de Verificação Completa:**

```bash
#!/bin/bash
# foundation-debug.sh

echo "🔍 Foundation Debug Report"
echo "=========================="

echo "\n📁 Project Structure:"
ls -la | grep -E "(server|client|shared|foundation)"

echo "\n📦 Package.json Type:"
grep '"type"' package.json || echo "type not set"

echo "\n🔧 Dependencies:"
npm ls express typescript --depth=0

echo "\n🌐 Server Status:"
curl -s -o /dev/null -w "Health: %{http_code}\n" http://localhost:5000/api/health
curl -s -o /dev/null -w "Foundation: %{http_code}\n" http://localhost:5000/foundation/setup

echo "\n📄 Foundation Files:"
ls -la foundation/ 2>/dev/null || echo "Foundation directory not found"
ls -la server/routes/foundation-setup.js 2>/dev/null || echo "Foundation route not found"

echo "\n✅ Scanner Result:"
node foundation/foundation-scanner.cjs 2>&1 | head -10
```

### **Script de Limpeza Completa:**

```bash
#!/bin/bash
# foundation-clean.sh

echo "🧹 Limpeza completa Foundation..."

# Remover Foundation
node foundation/foundation-remove.cjs 2>/dev/null

# Limpar node_modules
rm -rf node_modules package-lock.json

# Reinstalar dependências
npm install

# Verificar estado
node foundation/foundation-scanner.cjs
```

## 📞 Quando Buscar Ajuda

### **Cenários para Suporte Manual:**

1. **Projeto com arquitetura muito customizada**
2. **Múltiplos frameworks (Next.js + Express)**
3. **Monorepos complexos**
4. **Sistemas legados críticos**

### **Informações para Relatório de Bug:**

```bash
# Gerar relatório completo
echo "Foundation Debug Report" > debug-report.txt
echo "======================" >> debug-report.txt
node --version >> debug-report.txt
npm --version >> debug-report.txt
cat package.json >> debug-report.txt
node foundation/foundation-scanner.cjs >> debug-report.txt 2>&1
```

## 🎯 Prevenção de Problemas

### **Checklist Pré-Instalação:**

- [ ] `package.json` existe e é válido
- [ ] `"type": "module"` configurado
- [ ] Express e TypeScript instalados
- [ ] Estrutura server/client/shared criada
- [ ] Scanner retorna COMPATÍVEL

### **Checklist Pós-Instalação:**

- [ ] http://localhost:5000/foundation/setup responde 200
- [ ] http://localhost:5000/api/health responde 200
- [ ] Arquivo `.foundation-installed` existe
- [ ] Manifesto `.foundation-manifest.json` criado

### **Monitoramento Contínuo:**

```bash
# Verificação diária
node foundation/foundation-scanner.cjs > daily-check.log

# Backup automático
cp -r foundation/ foundation-backup-$(date +%Y%m%d)
```

---

**Última atualização:** 2025-07-04  
**Versão:** 3.0.0  
**Problemas cobertos:** Todos os identificados durante desenvolvimento real