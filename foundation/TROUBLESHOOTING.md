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
Error: Cannot find module '@/components/ui/button'
Cannot resolve dependency: lucide-react
```

**Causa:** Caminhos incorretos ou dependências ausentes

**Exemplo Real - Projeto React:**
```bash
# Erro comum encontrado
npm run dev
> Error: Cannot find module '@/components/ui/button'

# Diagnóstico
ls client/src/components/ui/
# Se não existe, instalar dependências UI
```

**Solução:**
```bash
# 1. Verificar aliases no vite.config.ts
cat vite.config.ts | grep "alias"

# 2. Instalar componentes UI ausentes
npm install @radix-ui/react-button lucide-react

# 3. Recriar componentes se necessário
mkdir -p client/src/components/ui
```

**Verificação:**
```bash
# Testar imports
node -e "console.log(require.resolve('@/lib/utils'))"
# Deve resolver sem erro
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

**Exemplo Real - Erro Comum:**
```bash
# Instalação falha com:
node foundation/foundation-installer.cjs
> TypeError: registerRoutes is not a function

# Verificar arquivo atual
cat server/routes.ts | head -5
> // Arquivo sem export function registerRoutes
```

**Solução:**
```typescript
// server/routes.ts - Template Correto
import { Express } from 'express';
import { createServer, Server } from 'http';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Foundation routes
  app.get('/foundation/setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/public/index.html'));
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
```

**Verificação:**
```bash
# Testar se função existe
node -e "import('./server/routes.js').then(m => console.log(typeof m.registerRoutes))"
# Deve mostrar: function
```

---

#### ❌ "Cannot GET /foundation/setup"

**Sintomas:**
```bash
curl http://localhost:5000/foundation/setup
# Retorna: Cannot GET /foundation/setup
```

**Exemplo Real - Rota Não Registrada:**
```bash
# Verificar se rota está definida
grep -r "/foundation/setup" server/
# Se não encontrar, rota não foi registrada

# Verificar se Foundation foi instalado
ls foundation/.foundation-manifest.json
# Se não existe, Foundation não instalado
```

**Solução:**
```typescript
// server/routes.ts - Adicionar rota Foundation
app.get('/foundation/setup', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

// Ou se Foundation não instalado:
node foundation/foundation-installer.cjs
```

### **3. Problemas de Dependências**

#### ❌ "Module not found: @radix-ui/react-button"

**Sintomas:**
```bash
npm run dev
> Error: Cannot resolve dependency @radix-ui/react-button
```

**Diagnóstico Rápido:**
```bash
# Verificar se dependência está instalada
npm list @radix-ui/react-button
# Se erro, não está instalada

# Verificar package.json
grep "radix-ui" package.json
```

**Solução:**
```bash
# Instalar dependências UI ausentes
npm install @radix-ui/react-button @radix-ui/react-slot
npm install lucide-react class-variance-authority

# Verificar instalação
npm list | grep radix
```

### **4. Problemas do Foundation**

#### ❌ "Foundation scanner fails with permission error"

**Sintomas:**
```bash
node foundation/foundation-scanner.cjs
> Error: EACCES: permission denied, open '.foundation-scanned'
```

**Causa Comum:** Permissões de arquivo incorretas

**Solução:**
```bash
# Corrigir permissões
chmod 755 foundation/
chmod 644 foundation/*.cjs
chmod 644 .foundation-*

# Testar novamente
node foundation/foundation-scanner.cjs
```

#### ❌ "Foundation installation stuck at verification"

**Exemplo Real:**
```bash
node foundation/foundation-installer.cjs
> Verificando compatibilidade...
> [instalação trava aqui]
```

**Diagnóstico:**
```bash
# Verificar se há processos travados
ps aux | grep foundation

# Verificar logs
tail -f foundation/logs/installation.log

# Forçar limpeza
rm -f .foundation-* foundation/.foundation-*
```

**Solução:**
```bash
# Reinstalação limpa
node foundation/foundation-remover.cjs --force --clean-traces
node foundation/foundation-installer.cjs --force
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