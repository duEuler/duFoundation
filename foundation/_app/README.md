# duEuler Foundation v3.0 - Aplicação Isolada

## Filosofia de Isolamento Total

Esta aplicação Foundation segue o princípio de **máximo isolamento** e **mínima intrusão** no projeto externo.

### Regras de Integração

#### ✅ PERMITIDO:
- Todas as funcionalidades dentro de `foundation/_app/`
- Modificação MÍNIMA do projeto externo (apenas App.tsx)
- Backup automático antes de qualquer modificação
- Sistema de rollback completo

#### ❌ PROIBIDO:
- Modificar package.json da raiz
- Alterar configurações Vite/Tailwind da raiz  
- Criar dependências no projeto externo
- Modificar mais de 1 arquivo externo

### Arquivos Externos Modificados

**ÚNICO arquivo modificado no projeto externo:**
- `client/src/App.tsx` - Apenas detecção Foundation e ponte para interface

### Estrutura de Integração

```
foundation/
├── _app/                          # TODA funcionalidade Foundation aqui
│   ├── src/                       # Código React isolado
│   ├── components/                # Componentes Foundation
│   ├── lib/                       # Utilitários isolados
│   └── README.md                  # Este arquivo
├── foundation-integrator-simple.cjs  # Script de integração mínima
├── .integration-backup/          # Backup dos arquivos modificados
└── .foundation-manifest.json     # Registro de modificações
```

### Como Funciona

1. **Instalação**: `foundation-integrator-simple.cjs` modifica apenas App.tsx
2. **Detecção**: App.tsx verifica se Foundation está instalado
3. **Ponte**: App.tsx redireciona para `/foundation/setup` quando necessário
4. **Isolamento**: Toda lógica complexa fica em `foundation/_app/`

### Scripts de Integração

```bash
# Aplicar integração mínima
node foundation/foundation-integrator-simple.cjs

# Remover integração completamente  
node foundation/foundation-integrator-simple.cjs remove
```

### Vantagens da Arquitetura

- **Portabilidade**: Foundation funciona em qualquer projeto
- **Reversibilidade**: Remoção completa sem rastros
- **Isolamento**: Zero dependências no projeto externo
- **Simplicidade**: Apenas 1 arquivo modificado externamente
- **Backup**: Restauração automática em caso de problemas

### Responsabilidades

**Foundation** (foundation/_app/):
- Interface do wizard
- Lógica de configuração
- Componentes UI
- Gerenciamento de estado
- APIs internas

**Projeto Externo** (raiz):
- Apenas ponte de acesso
- Detecção de instalação
- Redirecionamento básico

Esta arquitetura garante que o Foundation seja completamente independente e removível, respeitando a integridade do projeto hospedeiro.