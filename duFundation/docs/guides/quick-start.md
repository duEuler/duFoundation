# duFundation v3.1 - Guia de Início Rápido

<!-- Tags: getting-started, quick-start, installation, beginner -->
<!-- Dependencies: Node.js 18+, PostgreSQL, Git -->
<!-- Related: implementation-strategies.md, capacity-configs.md -->
<!-- Updated: 2025-07-04 -->

## 🚀 **Início em 5 Minutos**

Escolha sua estratégia baseada no tipo de projeto:

### **📋 Decisão Rápida**

```
NOVO PROJETO?
├── SIM → [Estratégia Nativo](#estratégia-nativo)
└── NÃO → 
    ├── PROJETO CRÍTICO? 
    │   ├── SIM → [Estratégia Microserviço](#estratégia-microserviço)
    │   └── NÃO → [Análise Detalhada](#análise-de-compatibilidade)
```

---

## 🆕 **Estratégia Nativo** (Projetos Novos)

### **1. Criação do Projeto**
```bash
# Criar projeto com duFundation integrado
dufundation create my-enterprise-app --strategy=native --capacity=small

# Navegar para projeto
cd my-enterprise-app
```

### **2. Configuração Inicial**
```bash
# Configurar environment
cp .env.example .env
# Edite DATABASE_URL no .env

# Setup database
npm run db:push

# Instalar dependências
npm install
```

### **3. Execução**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# ✅ Aplicação: http://localhost:5000
# 📊 Dashboard: http://localhost:5000/dashboard
# 🔐 Login: admin/admin123
```

### **Estrutura Gerada:**
```
my-enterprise-app/
├── duFundation/          # Sistema integrado
├── server/               # Backend otimizado
├── client/               # Frontend React
├── shared/               # Schemas compartilhados
└── package.json         # Dependencies consolidadas
```

**📚 Próximos Passos:** [Configurações Avançadas](../references/capacity-configs.md)

---

## 🔗 **Estratégia Microserviço** (Projetos Existentes)

### **1. Integração Não-Invasiva**
```bash
# Navegar para projeto existente
cd meu-projeto-existente

# Integrar duFundation como microserviço
dufundation integrate --strategy=microservice --port=3001
```

### **2. Configuração Dashboard**
```bash
# Navegar para dashboard
cd duFundation/dashboard

# Configurar environment
cp .env.example .env
# Configurar DATABASE_URL, PORT=3001

# Setup database independente
npm run db:push

# Instalar dependências
npm install
```

### **3. Execução Dual**
```bash
# Terminal 1: Projeto original
npm run dev  # localhost:3000

# Terminal 2: Dashboard duFundation
cd duFundation/dashboard && npm run dev  # localhost:3001

# ✅ App Principal: http://localhost:3000
# 📊 Dashboard: http://localhost:3001
# 🔐 Login: admin/admin123
```

### **Configuração Proxy (Opcional):**
```javascript
// Adicione ao seu servidor existente
app.use('/dashboard', proxy('http://localhost:3001'));
```

**📚 Próximos Passos:** [Configuração de Proxy](proxy-setup.md)

---

## 🔍 **Análise de Compatibilidade**

Para projetos existentes que precisam avaliação:

### **1. Scanner Automático**
```bash
# Baixar duFundation
git clone https://github.com/dueuler/dufundation.git
cd dufundation

# Executar análise
node core/scanner/foundation-scanner.cjs /path/to/your/project
```

### **2. Relatório de Compatibilidade**
```
🟢 COMPATÍVEL (80-100 pontos)
   → Estratégia Nativo recomendada
   
🟡 PRECISA AJUSTES (40-79 pontos)
   → Estratégia Microserviço + Migração
   
🔴 INCOMPATÍVEL (0-39 pontos)
   → Análise manual necessária
```

### **3. Ações Baseadas no Score**

#### **Score 80-100 (Verde):**
```bash
# Projeto pronto para integração
dufundation integrate --strategy=auto
```

#### **Score 40-79 (Amarelo):**
```bash
# Migração assistida
dufundation migrate --strategy=microservice --auto-fix
```

#### **Score 0-39 (Vermelho):**
```bash
# Consultar guia especializado
dufundation analyze --detailed --export-report
```

**📚 Próximos Passos:** [Guia de Migração](migration-guide.md)

---

## ⚙️ **Configurações por Capacidade**

### **Nano** (1K-10K usuários)
```bash
dufundation create app --capacity=nano
# 512MB RAM, 1 core, basic monitoring
```

### **Small** (50K-100K usuários) - **Recomendado**
```bash
dufundation create app --capacity=small
# 2GB RAM, 2 cores, full monitoring
```

### **Medium** (100K-500K usuários)
```bash
dufundation create app --capacity=medium
# 4GB RAM, 4 cores, advanced analytics
```

### **Large** (500K-1M usuários)
```bash
dufundation create app --capacity=large
# 8GB RAM, 8 cores, enterprise features
```

**📚 Especificações Completas:** [Configurações de Capacidade](../references/capacity-configs.md)

---

## 🛠️ **Comandos Essenciais**

### **Análise e Diagnóstico:**
```bash
dufundation analyze [path]           # Análise de compatibilidade
dufundation health-check             # Verificação do sistema
dufundation validate-config          # Validação de configuração
```

### **Criação e Integração:**
```bash
dufundation create <name>            # Novo projeto
dufundation integrate                # Projeto existente
dufundation upgrade                  # Atualizar versão
```

### **Manutenção:**
```bash
dufundation backup                   # Backup configurações
dufundation restore                  # Restaurar backup
dufundation uninstall               # Remover duFundation
```

---

## 📊 **Dashboard Features**

Após instalação, o dashboard oferece:

### **Monitoramento em Tempo Real:**
- ✅ CPU, Memória, Conexões ativas
- ✅ Request rate, Response time
- ✅ Database performance
- ✅ Error tracking

### **Gerenciamento:**
- ✅ User management
- ✅ System configuration
- ✅ Capacity scaling
- ✅ Security settings

### **Analytics:**
- ✅ Usage patterns
- ✅ Performance trends
- ✅ Business metrics
- ✅ Custom dashboards

---

## 🆘 **Solução Rápida de Problemas**

### **Erro: "Database connection failed"**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
dufundation test-database

# Recriar tabelas
npm run db:push
```

### **Erro: "Port 3001 already in use"**
```bash
# Usar porta alternativa
PORT=4000 npm run dev

# Ou parar processo
sudo lsof -ti:3001 | xargs kill -9
```

### **Erro: "Dashboard not loading"**
```bash
# Verificar status
dufundation health-check

# Reinstalar dashboard
cd duFundation/dashboard && npm install
```

**📚 Problemas Avançados:** [Troubleshooting Completo](troubleshooting.md)

---

## 📚 **Próximos Passos**

Após setup inicial:

1. **[Configurar Capacidade](../references/capacity-configs.md)** - Otimizar para seu caso de uso
2. **[Setup de Deploy](deployment.md)** - Preparar para produção
3. **[Monitoramento Avançado](monitoring-setup.md)** - Métricas customizadas
4. **[API Integration](../references/api-reference.md)** - Integrar com sistemas existentes

---

## 📞 **Suporte**

- **Documentação:** [docs.dufundation.com](https://docs.dufundation.com)
- **Issues:** [GitHub Issues](https://github.com/dueuler/dufundation/issues)
- **Discord:** [Community Discord](https://discord.gg/dufundation)
- **Email:** support@dufundation.com

---

<!-- File Metadata -->
**Arquivo:** `duFundation/docs/guides/quick-start.md`  
**Versão:** 3.1.0  
**Última Atualização:** July 4, 2025  
**Tags:** getting-started, quick-start, installation, beginner  
**Dependências:** Node.js 18+, PostgreSQL, Git  
**Arquivos Relacionados:**
- `implementation-strategies.md` - Estratégias detalhadas
- `../references/capacity-configs.md` - Configurações de capacidade
- `migration-guide.md` - Migração de projetos
- `troubleshooting.md` - Solução de problemas