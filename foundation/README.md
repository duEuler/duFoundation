# DuEuler Foundation v3.0 - Sistema Independente

## 🚀 Usando o Foundation com .replit

O foundation agora possui seu próprio arquivo `.replit` que permite execução independente como sub-projeto.

### Estrutura de Arquivos

```
foundation/
├── .replit                      ← Configuração do Replit específica
├── .config/
│   └── foundation.json          ← Configuração do framework
├── foundation-installer.cjs     ← Instalador principal
├── foundation.sh                ← Script de conveniência
├── scripts/
│   └── plant_foundation.cjs     ← Verificador de estrutura
└── README.md                    ← Este arquivo
```

### Como Usar

#### 1. Navegue para a pasta foundation
```bash
cd foundation
```

#### 2. Execute comandos diretos
```bash
# Instalar foundation
node foundation-installer.cjs

# Verificar estrutura
node scripts/plant_foundation.cjs

# Usar script bash
bash foundation.sh install
bash foundation.sh status
```

#### 3. Workflows do Replit (Se disponível)
O arquivo `.replit` define workflows para:
- **Foundation**: Workflow principal
- **Install Foundation**: Instala o sistema
- **Verify Foundation**: Verifica a estrutura
- **Foundation Status**: Mostra status atual
- **Foundation Help**: Exibe ajuda

### Funcionalidades

#### ✅ Sistema de Confirmação
- Pergunta obrigatória S/SIM antes de instalar
- Confirmação interativa via readline
- Prevenção de instalação acidental

#### ✅ Verificação de Estrutura
- Script `plant_foundation.cjs` verifica integridade
- Relatório detalhado de arquivos e pastas
- Validação de estrutura 100% plantada

#### ✅ Framework Independente
- Não depende do projeto principal
- Pode ser usado em qualquer projeto
- Estrutura autocontida

### Comandos Disponíveis

```bash
# Via Node.js
node foundation-installer.cjs    # Instalar
node scripts/plant_foundation.cjs # Verificar

# Via Bash
bash foundation.sh install       # Instalar
bash foundation.sh verify        # Verificar
bash foundation.sh status        # Status
bash foundation.sh help          # Ajuda
```

### Configuração

O arquivo `.config/foundation.json` contém todas as configurações:

```json
{
  "name": "DuEuler Foundation v3.0",
  "version": "3.0.0",
  "capacity": "SMALL",
  "installation": {
    "interactive": true,
    "confirmation": "required",
    "backup": true,
    "verification": true
  }
}
```

### Exemplo de Uso

```bash
# 1. Verificar status
bash foundation.sh status

# 2. Instalar foundation (com confirmação)
bash foundation.sh install
# Sistema perguntará: "Deseja instalar? (S/SIM): "
# Resposta: S

# 3. Verificar instalação
bash foundation.sh verify
```

### Integração com Projetos

#### Para projetos novos:
1. Copie a pasta `foundation/` para o projeto
2. Execute `cd foundation && bash foundation.sh install`
3. Responda S/SIM para confirmar

#### Para projetos existentes:
1. Copie a pasta `foundation/` para o projeto
2. Execute `cd foundation && bash foundation.sh install`
3. Sistema adaptará o projeto existente

### Vantagens do Sistema

1. **Independência**: Funciona sem depender do projeto principal
2. **Segurança**: Confirmação obrigatória antes da instalação
3. **Flexibilidade**: Pode ser usado em qualquer projeto
4. **Verificação**: Validação automática da estrutura
5. **Workflows**: Integração com Replit workflows

### Troubleshooting

#### Problema: "foundation não encontrado"
```bash
# Verificar se está na pasta correta
pwd
ls -la
```

#### Problema: "permission denied"
```bash
# Dar permissão ao script
chmod +x foundation.sh
```

#### Problema: Workflows não aparecem
- Workflows do Replit podem ter limitações
- Use comandos diretos como alternativa

### Resumo

O foundation é um **sistema independente** que:
- Possui seu próprio `.replit` em `foundation/.replit`
- Funciona como sub-projeto
- Não interfere no projeto principal
- Permite instalação interativa com confirmação
- Oferece verificação completa da estrutura

**Comando principal**: `bash foundation.sh install`