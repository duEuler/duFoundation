# Replit Order Execution - Regras Padrão

## Ordem de Prioridade Padrão no Replit

### **1º - `.replit` (MAIS IMPORTANTE)**
```bash
# Arquivo de configuração do Replit
run = "npm start"           # Comando principal
language = "nodejs"         # Linguagem do projeto
```
**Função:** Define como o Replit executa o projeto

### **2º - `package.json`**
```json
{
  "name": "meu-projeto",
  "main": "index.js",       # Ponto de entrada
  "scripts": {
    "start": "node index.js", # Comando start
    "dev": "nodemon app.js"   # Comando desenvolvimento
  }
}
```
**Função:** Configurações do Node.js e dependências

### **3º - Arquivo Principal (definido no package.json)**
```javascript
// index.js ou app.js ou server.js
const express = require('express');
const app = express();
// Código principal aqui
```
**Função:** Ponto de entrada da aplicação

### **4º - `replit.nix` (se existir)**
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.postgresql
  ];
}
```
**Função:** Dependências do sistema operacional

### **5º - Arquivos de Configuração**
```
.env          # Variáveis de ambiente
.gitignore    # Arquivos ignorados
README.md     # Documentação
```

## Comandos Principais por Arquivo

### **`.replit`**
```bash
run = "npm run dev"     # Comando ao clicar "Run"
compile = "npm install" # Comando de compilação
language = "nodejs"     # Define a linguagem
```

### **`package.json`**
```json
{
  "scripts": {
    "start": "node server.js",      # Produção
    "dev": "nodemon app.js",        # Desenvolvimento
    "build": "webpack --mode=prod", # Build
    "test": "jest"                  # Testes
  }
}
```

## Fluxo de Execução no Replit

1. **Replit lê `.replit`** → Sabe como executar
2. **Carrega `package.json`** → Instala dependências 
3. **Executa arquivo principal** → Inicia aplicação
4. **Aplica configurações** → `.env`, `replit.nix`
5. **Serve a aplicação** → Disponibiliza na web

---

## DuEuler Foundation Integration Points

### **Foundation-Specific Execution Order:**

1. **Detecção do Foundation** - Verifica se `foundation/` existe
2. **Leitura do Installer** - Executa `foundation/foundation-installer.cjs`
3. **Verificação de Estrutura** - Scripts `plant_foundation`
4. **Confirmação do Usuário** - Pergunta antes de instalar
5. **Instalação Completa** - Procede com setup completo

### **Integração com Replit:**
- Foundation se integra **após** a leitura do `package.json`
- Executa **antes** do arquivo principal da aplicação
- Usa próprio sistema de configuração e logs

Data: Julho 2025
Versão: DuEuler Foundation v3.0