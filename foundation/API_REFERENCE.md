# Foundation v3.0 - API Reference

## 📚 Referência Completa da API

Este documento fornece a referência completa para todas as APIs, scripts e interfaces do Foundation v3.0.

---

## 🔧 Scripts de Linha de Comando

### foundation-installer.cjs
**Descrição:** Script principal de instalação do Foundation

**Uso:**
```bash
node foundation/foundation-installer.cjs [opções]
```

**Opções:**
- `--capacity [small|medium|large|enterprise]` - Define capacidade do sistema
- `--name "Nome do Projeto"` - Nome do projeto
- `--force` - Força reinstalação mesmo se já existir
- `--dry-run` - Simula instalação sem modificar arquivos

**Exemplos:**
```bash
# Instalação básica
node foundation/foundation-installer.cjs

# Instalação com capacidade específica
node foundation/foundation-installer.cjs --capacity large

# Instalação com nome personalizado
node foundation/foundation-installer.cjs --name "Meu Projeto"
```

**Retorno:**
- Código 0: Sucesso
- Código 1: Erro de compatibilidade
- Código 2: Erro de instalação

---

### foundation-scanner.cjs
**Descrição:** Scanner automático de compatibilidade

**Uso:**
```bash
node foundation/foundation-scanner.cjs [opções]
```

**Opções:**
- `--full` - Análise completa incluindo dependências
- `--quiet` - Execução silenciosa
- `--report` - Gera relatório detalhado

**Exemplos:**
```bash
# Scanner básico
node foundation/foundation-scanner.cjs

# Análise completa
node foundation/foundation-scanner.cjs --full

# Relatório detalhado
node foundation/foundation-scanner.cjs --report
```

**Saída:**
- `foundation-scan-report.json` - Relatório de compatibilidade
- Console: Status de compatibilidade

---

### foundation-remover.cjs
**Descrição:** Desinstalação inteligente do Foundation

**Uso:**
```bash
node foundation/foundation-remover.cjs [opções]
```

**Opções:**
- `--backup` - Cria backup antes da remoção
- `--force` - Remove sem confirmação
- `--clean-traces` - Remove todos os rastros incluindo flags

**Exemplos:**
```bash
# Remoção com backup
node foundation/foundation-remover.cjs --backup

# Remoção completa
node foundation/foundation-remover.cjs --clean-traces
```

---

## 🌐 APIs Web

### /foundation/setup
**Método:** GET  
**Descrição:** Interface web de configuração inicial

**Parâmetros de Query:**
- `step` - Etapa atual do setup (1-4)
- `mode` - Modo de instalação (auto|manual)

**Resposta:** Interface HTML de configuração

---

### /api/setup
**Método:** POST  
**Descrição:** Endpoint para configuração do sistema

**Body (JSON):**
```json
{
  "organizationName": "string (obrigatório)",
  "adminEmail": "string (obrigatório)",
  "adminPassword": "string (obrigatório)",
  "capacity": "small|medium|large|enterprise",
  "features": ["monitoring", "analytics", "security"]
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "systemId": "uuid",
  "adminUserId": "number",
  "message": "Sistema configurado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "Descrição do erro",
  "field": "campo_com_erro"
}
```

---

### /foundation/uninstall
**Método:** GET/POST  
**Descrição:** Interface e processamento de desinstalação

**GET:** Interface de desinstalação  
**POST:** Executa desinstalação

**Body POST (JSON):**
```json
{
  "confirmUninstall": true,
  "keepBackup": boolean,
  "cleanTraces": boolean
}
```

---

## 📊 Configurações do Sistema

### foundation.config.json
**Localização:** `foundation/foundation.config.json`

**Estrutura:**
```json
{
  "version": "3.0",
  "capacity": "small|medium|large|enterprise",
  "features": {
    "monitoring": boolean,
    "analytics": boolean,
    "security": boolean,
    "automation": boolean
  },
  "database": {
    "provider": "postgresql",
    "maxConnections": number
  },
  "server": {
    "port": number,
    "host": "string",
    "ssl": boolean
  },
  "installation": {
    "date": "ISO string",
    "manifest": "array de arquivos instalados"
  }
}
```

---

## 🔍 Verificação de Compatibilidade

### verifyCompatibilityMandatory()
**Arquivo:** `foundation/compatibility-checker.js`

**Descrição:** Verifica compatibilidade obrigatória antes de instalação

**Retorno:**
```javascript
{
  compatible: boolean,
  errors: Array<string>,
  warnings: Array<string>,
  requirements: {
    nodeVersion: string,
    moduleType: "module" | "commonjs",
    hasDatabase: boolean
  }
}
```

**Verificações realizadas:**
- Versão do Node.js >= 16
- Tipo de módulo (ES modules vs CommonJS)
- Estrutura de projeto
- Dependências necessárias
- Configuração do servidor

---

## 🏗️ Templates de Projeto

### Capacidades Disponíveis

#### SMALL (1K-10K usuários)
- CPU: 1-2 cores
- RAM: 512MB-2GB
- Storage: 10GB-50GB
- Features: Básicas

#### MEDIUM (10K-100K usuários)
- CPU: 2-4 cores
- RAM: 2GB-8GB
- Storage: 50GB-200GB
- Features: Monitoramento básico

#### LARGE (100K-500K usuários)
- CPU: 4-8 cores
- RAM: 8GB-32GB
- Storage: 200GB-1TB
- Features: Monitoramento avançado, analytics

#### ENTERPRISE (500K+ usuários)
- CPU: 8+ cores
- RAM: 32GB+
- Storage: 1TB+
- Features: Todas + segurança empresarial

---

## 📁 Estrutura de Arquivos

### Arquivos Criados pela Instalação

```
foundation/
├── foundation-installer.cjs     # Installer principal
├── foundation-scanner.cjs       # Scanner de compatibilidade
├── foundation-remover.cjs       # Desinstalador
├── foundation.config.json       # Configuração do sistema
├── .foundation-manifest.json    # Manifest de instalação
└── templates/                   # Templates por capacidade
    ├── small/
    ├── medium/
    ├── large/
    └── enterprise/
```

### Arquivos Modificados

```
server/
├── index.ts                     # Rotas Foundation adicionadas
└── routes.ts                    # Endpoints /foundation/*

client/src/
├── App.tsx                      # Rotas Foundation
└── foundation-setup.tsx         # Interface de setup
```

---

## 🔒 Segurança e Permissões

### Permissões Necessárias
- Leitura/escrita na pasta do projeto
- Acesso ao banco de dados (se configurado)
- Permissões de rede para porta do servidor

### Validações de Segurança
- Validação de input em todos os endpoints
- Sanitização de dados de configuração
- Verificação de integridade dos templates
- Backup automático antes de modificações

---

## 🐛 Códigos de Erro

### Códigos de Compatibilidade
- `COMPAT_001`: Versão Node.js incompatível
- `COMPAT_002`: Tipo de módulo incompatível
- `COMPAT_003`: Estrutura de projeto inválida
- `COMPAT_004`: Dependências ausentes
- `COMPAT_005`: Configuração de servidor inválida

### Códigos de Instalação
- `INSTALL_001`: Falha ao criar arquivos
- `INSTALL_002`: Falha ao modificar arquivos existentes
- `INSTALL_003`: Falha na configuração do banco
- `INSTALL_004`: Foundation já instalado
- `INSTALL_005`: Espaço em disco insuficiente

### Códigos de Desinstalação
- `UNINSTALL_001`: Manifest não encontrado
- `UNINSTALL_002`: Falha ao remover arquivos
- `UNINSTALL_003`: Falha no backup
- `UNINSTALL_004`: Foundation não instalado

---

## 📈 Monitoramento e Logs

### Logs de Sistema
**Localização:** `foundation/logs/`

- `installation.log` - Log de instalação
- `scanner.log` - Log do scanner
- `uninstall.log` - Log de desinstalação
- `system.log` - Logs gerais do sistema

### Métricas Coletadas
- Tempo de instalação
- Recursos utilizados
- Erros encontrados
- Compatibilidade verificada

---

## 🔄 Versionamento

### Versão Atual: 3.0

**Compatibilidade:**
- Node.js >= 16
- PostgreSQL >= 12
- ES Modules support

**Breaking Changes da v2.0:**
- Migração para ES Modules obrigatória
- Nova estrutura de configuração
- API endpoints reorganizados

---

## 📞 Suporte e Troubleshooting

### Logs de Debug
Para habilitar logs detalhados:
```bash
DEBUG=foundation:* node foundation/foundation-installer.cjs
```

### Arquivos de Diagnóstico
- `foundation-scan-report.json` - Relatório de compatibilidade
- `foundation/logs/installation.log` - Log detalhado de instalação
- `.foundation-manifest.json` - Lista de arquivos instalados

### Links Úteis
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Guia de resolução de problemas
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Guia de primeiros passos
- [README.md](./README.md) - Documentação principal

---

*Última atualização: 4 de Julho de 2025*  
*Foundation v3.0 - Sistema de Gestão Empresarial*