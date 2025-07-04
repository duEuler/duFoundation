# Foundation v3.0 - Comandos Sincronizados

## 📋 Padronização Universal de Comandos

Este documento centraliza e sincroniza todos os comandos da Foundation v3.0, garantindo consistência entre todos os documentos de referência.

---

## 🔧 Comandos Principais

### **Instalação**
```bash
# Comando principal de instalação
node foundation/foundation-installer.cjs

# Instalação com capacidade específica
node foundation/foundation-installer.cjs --capacity [small|medium|large|enterprise]

# Instalação com nome do projeto
node foundation/foundation-installer.cjs --name "Nome do Projeto"

# Instalação forçada (reinstalação)
node foundation/foundation-installer.cjs --force

# Simulação de instalação (dry run)
node foundation/foundation-installer.cjs --dry-run
```

### **Scanner de Compatibilidade**
```bash
# Scanner básico
node foundation/foundation-scanner.cjs

# Scanner completo com dependências
node foundation/foundation-scanner.cjs --full

# Scanner silencioso
node foundation/foundation-scanner.cjs --quiet

# Scanner com relatório detalhado
node foundation/foundation-scanner.cjs --report
```

### **Desinstalação**
```bash
# Desinstalação com backup
node foundation/foundation-remover.cjs --backup

# Desinstalação forçada (sem confirmação)
node foundation/foundation-remover.cjs --force

# Limpeza completa de rastros
node foundation/foundation-remover.cjs --clean-traces
```

### **Validação de Links**
```bash
# Validação completa de links
node foundation/validate-links.cjs

# Comando para filtrar apenas Foundation (excluir node_modules)
node foundation/validate-links.cjs | grep -v "node_modules"
```

---

## 🌐 Interface Web

### **URLs de Acesso (após instalação)**
- **Setup Inicial:** http://localhost:5000/foundation/setup
- **Desinstalação:** http://localhost:5000/foundation/uninstall
- **API Setup:** http://localhost:5000/api/setup (POST)

---

## 📊 Comandos de Monitoramento

### **Status do Sistema**
```bash
# Verificar se Foundation está instalado
ls foundation/.foundation-manifest.json

# Ver configuração atual
cat foundation/foundation.config.json

# Verificar logs de instalação
cat foundation/logs/installation.log

# Ver relatório de scanner
cat foundation/foundation-scan-report.json
```

### **Debug e Logs**
```bash
# Habilitar logs detalhados
DEBUG=foundation:* node foundation/foundation-installer.cjs

# Ver logs do sistema
tail -f foundation/logs/system.log

# Verificar logs de erro
tail -f foundation/logs/installation.log
```

---

## 🏗️ Comandos de Desenvolvimento

### **Gestão de Arquivos**
```bash
# Listar arquivos Foundation
find foundation -name "*.md" | grep -v node_modules

# Backup manual da configuração
cp foundation/foundation.config.json foundation.config.backup.json

# Verificar integridade do manifest
node -e "console.log(JSON.parse(require('fs').readFileSync('foundation/.foundation-manifest.json')))"
```

### **Comandos de Limpeza**
```bash
# Limpar logs antigos
rm -f foundation/logs/*.log

# Limpar relatórios de scanner
rm -f foundation/foundation-*-report.json

# Limpar flags de scanner
rm -f .foundation-scanned .foundation-ignore
```

---

## 🔄 Comandos Avançados

### **Migração e Backup**
```bash
# Criar backup completo antes de alterações
cp -r foundation foundation-backup-$(date +%Y%m%d)

# Restaurar backup
cp -r foundation-backup-YYYYMMDD foundation

# Migrar configuração para nova versão
node foundation/foundation-installer.cjs --migrate
```

### **Capacidades do Sistema**
```bash
# Verificar capacidade atual
grep '"capacity"' foundation/foundation.config.json

# Atualizar capacidade
node foundation/foundation-installer.cjs --capacity enterprise --upgrade

# Listar capacidades disponíveis
node foundation/foundation-installer.cjs --list-capacities
```

---

## 📈 Comandos de Verificação

### **Testes de Integridade**
```bash
# Teste completo do sistema
node foundation/test-installation.cjs

# Verificação de compatibilidade obrigatória
node foundation/compatibility-checker.js

# Verificação abrangente
node foundation/comprehensive-checker.js
```

### **Validação de Documentação**
```bash
# Validar todos os links
node foundation/validate-links.cjs

# Verificar referências quebradas
grep -r "foundation-setup" foundation/ --include="*.md"

# Verificar consistência de versão
grep -r "v[0-9]\." foundation/ --include="*.md"
```

---

## 🚨 Comandos de Emergência

### **Recuperação do Sistema**
```bash
# Forçar reinstalação limpa
node foundation/foundation-remover.cjs --force --clean-traces
node foundation/foundation-installer.cjs --force

# Resetar para estado virgem
rm -f .foundation-* foundation/.foundation-*
npm run dev

# Restaurar backups automáticos
cp foundation/.installation-backup/* foundation/
```

### **Diagnóstico Rápido**
```bash
# Verificar se servidor está rodando
curl http://localhost:5000/foundation/setup

# Testar API de setup
curl -X POST http://localhost:5000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verificar dependências críticas
node -e "console.log(process.version)"
npm list --depth=0
```

---

## 📋 Referência Rápida

### **Sequência Padrão de Instalação**
```bash
# 1. Scanner de compatibilidade
node foundation/foundation-scanner.cjs

# 2. Instalação
node foundation/foundation-installer.cjs

# 3. Verificação
curl http://localhost:5000/foundation/setup

# 4. Configuração via web ou API
# Web: http://localhost:5000/foundation/setup
# API: POST /api/setup
```

### **Sequência de Desinstalação**
```bash
# 1. Backup (opcional)
node foundation/foundation-remover.cjs --backup

# 2. Desinstalação completa
node foundation/foundation-remover.cjs --clean-traces

# 3. Verificação
ls foundation/.foundation-* # Deve estar vazio
```

---

## 📚 Documentos Sincronizados

Este documento sincroniza comandos presentes em:

- [README.md](./README.md) - Comandos básicos
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Comandos de iniciação
- [API_REFERENCE.md](./API_REFERENCE.md) - Comandos de API
- [INSTALLATION_COMMANDS_CONSOLIDATED.md](./INSTALLATION_COMMANDS_CONSOLIDATED.md) - Comandos consolidados
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Comandos de solução de problemas
- [core/TEMPLATE_SYSTEM_GUIDE.md](./core/TEMPLATE_SYSTEM_GUIDE.md) - Comandos técnicos avançados

---

## ⚡ Comandos Por Categoria

### **🚀 Início Rápido**
```bash
node foundation/foundation-scanner.cjs && \
node foundation/foundation-installer.cjs
```

### **🔧 Desenvolvimento**
```bash
DEBUG=foundation:* node foundation/foundation-installer.cjs --dry-run
```

### **🧹 Manutenção**
```bash
node foundation/validate-links.cjs && \
node foundation/foundation-scanner.cjs --full
```

### **🚨 Emergência**
```bash
node foundation/foundation-remover.cjs --force --clean-traces && \
node foundation/foundation-installer.cjs --force
```

---

*Foundation v3.0 - Comandos sincronizados em todos os documentos*  
*Última atualização: 4 de Julho de 2025*