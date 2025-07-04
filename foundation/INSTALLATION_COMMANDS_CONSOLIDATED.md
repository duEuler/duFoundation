# Foundation v3.0 - Comandos de Instalação Consolidados

## 📋 COMANDOS PADRONIZADOS

### 🚀 Instalação Básica

```bash
# Instalação completa (recomendado)
node foundation/foundation-installer.cjs

# Instalação com capacidade específica
node foundation/foundation-installer.cjs --capacity enterprise

# Instalação com nome personalizado  
node foundation/foundation-installer.cjs --name "MeuProjeto" --capacity small
```

### 🔍 Verificação e Status

```bash
# Verificar status do Foundation
bash foundation/foundation.sh status

# Verificar estrutura instalada
node foundation/scripts/plant_foundation.cjs

# Scanner automático (primeira execução)
node foundation/foundation-scanner.cjs
```

### ⚙️ Configuração Avançada

```bash
# Instalação verbose para debug
node foundation/foundation-installer.cjs --capacity enterprise --verbose

# Instalação sem dependências
node foundation/foundation-installer.cjs --skip-deps --capacity micro

# Migração de capacidade
node foundation/foundation-installer.cjs --capacity large --name "ProjetoExistente"
```

### 🗑️ Remoção e Limpeza

```bash
# Remover Foundation completamente
node foundation/foundation-remover.cjs

# Limpeza inteligente de rastros
node foundation/foundation-remover.cjs --clean-traces

# Via comando global (se disponível)
bash foundation/foundation.sh remove
```

## 📂 CAPACIDADES DISPONÍVEIS

| Capacidade | Usuários | Comando |
|------------|----------|---------|
| **NANO** | 1-100 | `--capacity nano` |
| **MICRO** | 100-1K | `--capacity micro` |
| **SMALL** | 1K-10K | `--capacity small` |
| **LARGE** | 10K-100K | `--capacity large` |
| **ENTERPRISE** | 100K+ | `--capacity enterprise` |

## 🎯 EXEMPLOS PRÁTICOS

### Novo Projeto Enterprise
```bash
node foundation/foundation-installer.cjs \
  --capacity enterprise \
  --name "PlataformaEmpresarial" \
  --description "Sistema empresarial completo"
```

### Projeto Pequeno/Startup
```bash
node foundation/foundation-installer.cjs \
  --capacity micro \
  --name "StartupApp" \
  --description "Aplicação para startup"
```

### Migração de Projeto Existente
```bash
# 1. Backup primeiro
cp package.json package.json.backup

# 2. Aplicar Foundation
node foundation/foundation-installer.cjs \
  --capacity large \
  --name "ProjetoExistente"

# 3. Verificar resultado
bash foundation/foundation.sh status
```

## ⚠️ COMANDOS OBSOLETOS

❌ **NÃO USAR MAIS:**
- `node automation/foundation-setup.cjs`
- `node dueuler-foundation/automation/foundation-setup.cjs`
- `node foundation-setup.cjs`
- `node install-foundation-app.cjs`

✅ **USAR SEMPRE:**
- `node foundation/foundation-installer.cjs`
- `node foundation/foundation-scanner.cjs`
- `node foundation/foundation-remover.cjs`

## 🔧 TROUBLESHOOTING

### Erro de Compatibilidade
```bash
# Verificar compatibilidade ANTES da instalação
node foundation/compatibility-checker.js
```

### Problema na Instalação
```bash
# Verificação completa com antecipação de problemas
node foundation/comprehensive-checker.js
```

### Reset Completo
```bash
# Remover tudo e começar do zero
node foundation/foundation-remover.cjs --force
node foundation/foundation-installer.cjs --capacity enterprise
```

---
**Documento atualizado:** 4 de Julho de 2025  
**Versão:** Foundation v3.0  
**Status:** Comandos validados e testados