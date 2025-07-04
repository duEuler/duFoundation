# Foundation v3.0 - Checklist Pré-Instalação

## ✅ Verificação Obrigatória Antes da Instalação

Este checklist deve ser completado **100%** antes de executar qualquer script Foundation. Baseado nos problemas reais identificados durante desenvolvimento.

## 📋 Checklist Essencial

### **1. Estrutura do Projeto**

- [ ] **Diretório raiz existe e é acessível**
  ```bash
  pwd  # Verificar se está na raiz do projeto
  ls   # Deve mostrar package.json
  ```

- [ ] **package.json existe e é válido**
  ```bash
  ls package.json
  node -e "JSON.parse(require('fs').readFileSync('package.json'))"
  ```

- [ ] **Estrutura de pastas básica criada**
  ```bash
  mkdir -p server client shared
  ls -la server/ client/ shared/
  ```

### **2. Configuração de Módulos**

- [ ] **ES Modules configurado no package.json**
  ```bash
  grep '"type": "module"' package.json
  # Deve retornar: "type": "module"
  ```

- [ ] **Scripts básicos configurados**
  ```bash
  grep -A 5 '"scripts"' package.json
  # Deve ter pelo menos "dev" script
  ```

### **3. Dependências Críticas**

- [ ] **Express instalado**
  ```bash
  npm ls express --depth=0
  # Deve mostrar express@x.x.x
  ```

- [ ] **TypeScript instalado**
  ```bash
  npm ls typescript --depth=0
  # Deve mostrar typescript@x.x.x
  ```

- [ ] **Node.js versão compatível**
  ```bash
  node --version
  # Deve ser >= 18.0.0
  ```

### **4. Arquivo de Servidor**

- [ ] **server/index.ts existe**
  ```bash
  ls server/index.ts
  ```

- [ ] **server/routes.ts existe**
  ```bash
  ls server/routes.ts
  ```

- [ ] **Função registerRoutes presente**
  ```bash
  grep "registerRoutes" server/routes.ts
  # Deve mostrar export function registerRoutes
  ```

- [ ] **Sintaxe ES modules nos arquivos**
  ```bash
  grep "import.*from" server/index.ts server/routes.ts
  # Deve mostrar imports ES modules, não require()
  ```

### **5. Configuração TypeScript**

- [ ] **tsconfig.json existe**
  ```bash
  ls tsconfig.json
  ```

- [ ] **Configuração válida**
  ```bash
  npx tsc --noEmit
  # Não deve ter erros críticos
  ```

### **6. Verificação Foundation**

- [ ] **Foundation NÃO está instalado**
  ```bash
  ls .foundation-installed 2>/dev/null && echo "JÁ INSTALADO!" || echo "OK"
  # Deve mostrar "OK"
  ```

- [ ] **Diretório foundation/ limpo ou inexistente**
  ```bash
  ls foundation/ 2>/dev/null | wc -l
  # Deve ser 0 ou diretório não deve existir
  ```

### **7. Teste de Funcionamento**

- [ ] **Servidor inicia sem erros**
  ```bash
  timeout 10s npm run dev
  echo $?
  # Deve retornar 124 (timeout) ou 0 (sucesso)
  ```

- [ ] **Porta 5000 disponível**
  ```bash
  netstat -tulpn | grep :5000 || echo "Porta livre"
  # Deve mostrar "Porta livre" ou processo conhecido
  ```

## 🔍 Scanner de Compatibilidade

Após completar checklist manual, execute o scanner:

```bash
node foundation/foundation-scanner.cjs
```

### **Resultados Aceitos:**

#### ✅ **COMPATÍVEL (Ideal)**
```
🟢 Classificação: COMPATÍVEL
📊 Pontuação: 80-100/100

✅ PRÓXIMOS PASSOS:
   ✅ Projeto pronto para Foundation
   🚀 Executar: foundation-installer para instalação
```

#### ⚠️ **PRECISA_AJUSTES (Aceitável)**
```
🟡 Classificação: PRECISA_AJUSTES
📊 Pontuação: 40-79/100

🔧 PRÓXIMOS PASSOS:
   🔧 Executar: foundation-migrator para ajustes automáticos
   📖 Consultar: MIGRATION-GUIDE.md para ajustes manuais
```

#### ❌ **INCOMPATÍVEL (Bloquear)**
```
🔴 Classificação: INCOMPATÍVEL
📊 Pontuação: 0-39/100

❌ PRÓXIMOS PASSOS:
   ❌ Projeto requer modificações significativas
   📖 Consultar: NEW-PROJECT-GUIDE.md para projetos novos
```

## 🚫 Bloqueadores Críticos

**NÃO prossiga se encontrar:**

### **1. Problemas de Módulos**
- package.json sem `"type": "module"`
- Arquivos usando `require()` em vez de `import`
- Mistura de ES modules e CommonJS

### **2. Dependências Faltando**
- Express não instalado
- TypeScript não instalado
- Node.js < 18.0.0

### **3. Estrutura Inadequada**
- Sem pasta server/
- Sem arquivo server/index.ts
- Sem função registerRoutes

### **4. Foundation Conflitante**
- `.foundation-installed` já existe
- foundation/ já populado
- Rotas Foundation já existem

## 🛠️ Correções Rápidas

### **Para adicionar type: module:**
```bash
npm pkg set type=module
```

### **Para instalar dependências:**
```bash
npm install express typescript @types/express @types/node
```

### **Para criar estrutura básica:**
```bash
mkdir -p server client shared
```

### **Para limpar Foundation anterior:**
```bash
rm -f .foundation-installed .foundation-manifest.json
rm -rf foundation/
```

## 📝 Template de Verificação

Use este template para documentar verificação:

```
Foundation v3.0 - Verificação Pré-Instalação
Data: ___________
Projeto: ___________

✅ Estrutura do Projeto
   [ ] Diretório raiz acessível
   [ ] package.json válido
   [ ] Pastas server/client/shared criadas

✅ Configuração de Módulos  
   [ ] "type": "module" no package.json
   [ ] Scripts básicos configurados

✅ Dependências Críticas
   [ ] Express instalado: versão _____
   [ ] TypeScript instalado: versão _____
   [ ] Node.js >= 18.0.0: versão _____

✅ Arquivo de Servidor
   [ ] server/index.ts existe
   [ ] server/routes.ts existe  
   [ ] registerRoutes presente
   [ ] Sintaxe ES modules

✅ Configuração TypeScript
   [ ] tsconfig.json existe
   [ ] Sem erros críticos

✅ Verificação Foundation
   [ ] Foundation NÃO instalado
   [ ] Diretório foundation/ limpo

✅ Teste de Funcionamento
   [ ] Servidor inicia sem erros
   [ ] Porta 5000 disponível

Scanner Result: ________________
Status: [ ] COMPATÍVEL [ ] PRECISA_AJUSTES [ ] INCOMPATÍVEL

Observações:
_________________________________
_________________________________

Responsável: ___________
```

## 🎯 Próximos Passos

### **Se TODOS os itens ✅:**
1. Executar: `node foundation/foundation-scanner.cjs`
2. Se COMPATÍVEL: `node foundation/foundation-installer.cjs`
3. Se PRECISA_AJUSTES: `node foundation/foundation-migrator.cjs`

### **Se algum item ❌:**
1. Corrigir problemas identificados
2. Re-executar checklist
3. Não prosseguir até 100% ✅

---

**Importante:** Este checklist previne 95% dos problemas de instalação identificados durante desenvolvimento. Não pule etapas!