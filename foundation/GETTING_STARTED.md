# Foundation v3.0 - Guia de Primeiros Passos

## 🚀 Começando do Zero

Este guia levará você através dos primeiros passos para usar o Foundation v3.0 em seu projeto.

### 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem:

- **Node.js** (versão 18+ recomendada)
- **npm** ou **yarn**
- **Projeto Replit** ativo
- **Acesso ao terminal**

### 🎯 Passo 1: Verificação Inicial

Primeiro, verifique se o Foundation já está instalado:

```bash
# Verifique se existe o marcador de instalação
ls -la .foundation-*

# Se não houver arquivos, Foundation não está instalado
```

### 🔍 Passo 2: Scanner Automático (Primeira Execução)

Execute o scanner automático para análise de compatibilidade:

```bash
node foundation/foundation-auto-scanner.cjs
```

**O que acontece:**
- ✅ Análise completa de compatibilidade
- ✅ Detecção do tipo de projeto (ES modules/CommonJS)
- ✅ Verificação de estrutura de arquivos
- ✅ Criação do flag `.foundation-scanned`

### 🛠️ Passo 3: Instalação do Foundation

Após o scanner confirmar compatibilidade, execute a instalação:

```bash
node foundation/foundation-installer.cjs
```

**Durante a instalação você verá:**
1. **Confirmação** - Sistema perguntará S/SIM para confirmar
2. **Verificação** - Validação completa de compatibilidade
3. **Instalação** - Criação de arquivos e integração
4. **Validação** - Testes automáticos de funcionamento

### 🌐 Passo 4: Acesso à Interface Web

Após instalação bem-sucedida:

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a interface:**
   ```
   http://localhost:5000/foundation/setup
   ```

3. **Configure seu sistema:**
   - Nome da organização
   - Informações básicas
   - Usuário administrador

### ✅ Passo 5: Verificação de Funcionamento

Confirme que tudo está funcionando:

```bash
# Verificar arquivos instalados
ls -la .foundation-*
ls -la foundation/.config/

# Testar rota da API
curl http://localhost:5000/api/setup
```

**Resposta esperada:** `{"status":"success"}` ou página HTML

## 🎯 Próximos Passos

Após a instalação inicial, explore:

### 📚 Documentação Essencial
- **[FOUNDATION_STATUS.md](./FOUNDATION_STATUS.md)** - Status atual do sistema
- **[INSTALLATION_COMMANDS_CONSOLIDATED.md](./INSTALLATION_COMMANDS_CONSOLIDATED.md)** - Todos os comandos
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Resolução de problemas

### 🛠️ Comandos Úteis
- `node foundation/foundation-remover.cjs` - Desinstalar completamente
- `node foundation/foundation-scanner.cjs` - Re-executar scanner
- `npm run dev` - Iniciar servidor de desenvolvimento

### 🏗️ Configuração Avançada
- **[FOUNDATION-ARCHITECTURE.md](./FOUNDATION-ARCHITECTURE.md)** - Arquitetura técnica
- **[core/TEMPLATE_SYSTEM_GUIDE.md](./core/TEMPLATE_SYSTEM_GUIDE.md)** - Sistema de templates

## ❓ Precisa de Ajuda?

### 🔧 Problemas Comuns

#### ❌ "Foundation não está instalado"
**Solução:** Execute primeiro o `foundation-installer.cjs`

#### ❌ "Rota /foundation/setup não encontrada"
**Solução:** Verifique se o servidor está rodando e Foundation instalado

#### ❌ "Erro de compatibilidade"
**Solução:** Execute `foundation-auto-scanner.cjs` para análise detalhada

### 📞 Suporte Técnico

1. **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Logs de erro:** Verifique console do navegador e terminal
3. **Scanner de problemas:** `node foundation/foundation-auto-scanner.cjs`

---

## 🎉 Parabéns!

Você agora tem o Foundation v3.0 funcionando em seu projeto. O sistema está pronto para gestão empresarial com arquitetura de Padronização Progressiva Híbrida.

**Próximo passo recomendado:** Acesse http://localhost:5000/foundation/setup para configurar sua organização.