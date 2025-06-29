# Guia de Configuração replit.md

## Visão Geral

Este guia explica como aplicar as configurações do `replit.md` em novos sistemas usando a duEuler Foundation. O arquivo `replit.md` serve como a documentação central do projeto, mantendo contexto, preferências do usuário e decisões arquiteturais.

## Por que o replit.md é Importante

O `replit.md` funciona como:
- **Memória do sistema**: Mantém contexto entre sessões
- **Documentação viva**: Atualizada automaticamente com mudanças
- **Guia de preferências**: Registra estilo de comunicação e decisões técnicas
- **Histórico do projeto**: Rastreia evolução e mudanças importantes

## Template Disponível

A foundation inclui um template completo em:
```
dueuler-foundation/templates/replit.md.template
```

## Script de Configuração Automática

Use o script automatizado para aplicar configurações:
```bash
node dueuler-foundation/automation/setup-replit-md.cjs --apply-existing
```

### Opções do Script

```bash
# Aplicar configurações do projeto atual
node setup-replit-md.cjs --apply-existing

# Configuração manual
node setup-replit-md.cjs --capacity enterprise --name "Meu Projeto"

# Ver ajuda
node setup-replit-md.cjs --help
```

## Configuração Manual

### 1. Copiar Template

```bash
cp dueuler-foundation/templates/replit.md.template ./replit.md
```

### 2. Substituir Placeholders

O template usa placeholders que devem ser substituídos:

#### Informações Básicas
- `{{PROJECT_NAME}}`: Nome do projeto
- `{{PROJECT_DESCRIPTION}}`: Descrição breve
- `{{PROJECT_OVERVIEW}}`: Visão geral detalhada
- `{{USER_PREFERENCES}}`: Preferências de comunicação

#### Capacidades por Tier
- `{{URGENT_GAPS_COUNT}}`: Número de gaps urgentes (padrão: 6)
- `{{MICRO_GAPS_COUNT}}`: Número de gaps micro (padrão: 15)
- `{{SMALL_GAPS_COUNT}}`: Número de gaps small (padrão: 9)
- `{{LARGE_GAPS_COUNT}}`: Número de gaps large
- `{{ENTERPRISE_GAPS_COUNT}}`: Número de gaps enterprise

#### APIs e Funcionalidades
- `{{TOTAL_APIS_COUNT}}`: Total de APIs implementadas
- `{{URGENT_GAPS_APIS}}`: Lista de APIs urgentes
- `{{MICRO_GAPS_APIS}}`: Lista de APIs micro
- `{{LARGE_OPERATIONS}}`: Operações large capacity
- `{{ENTERPRISE_OPERATIONS}}`: Operações enterprise

#### Datas e Histórico
- `{{PROJECT_START_DATE}}`: Data de início
- `{{CURRENT_DATE}}`: Data atual
- `{{RECENT_CHANGES}}`: Mudanças recentes

## Configurações por Capacidade

### NANO (Básico)
- APIs: 11 core APIs
- Funcionalidades: Autenticação, CRUD básico
- Ideal para: Protótipos, projetos pequenos

### MICRO (Até 1K usuários)
- APIs: 32 total
- Adiciona: Cache Redis, Queue system, Search
- Ideal para: Aplicações pequenas a médias

### SMALL (Até 10K usuários)
- APIs: 41 total
- Adiciona: Load balancer, WebSockets, Security avançada
- Ideal para: Aplicações médias

### LARGE (100K-1M usuários)
- APIs: 49 total
- Adiciona: Kubernetes, ML Ops, CDN global
- Ideal para: Aplicações grandes

### ENTERPRISE (1M+ usuários)
- APIs: 69 total
- Adiciona: Service mesh, Data governance, MLOps completo
- Ideal para: Sistemas enterprise

## Detecção Automática de Capacidade

O script detecta automaticamente a capacidade baseado em arquivos existentes:

```javascript
// Detecta enterprise
if (fs.existsSync('server/services/kubernetesNative.ts')) {
  capacity = 'enterprise';
}
// Detecta large
else if (fs.existsSync('server/services/loadBalancer.ts')) {
  capacity = 'large';
}
// Detecta small
else if (fs.existsSync('server/services/websocketService.ts')) {
  capacity = 'small';
}
// Detecta micro
else if (fs.existsSync('server/services/redisCache.ts')) {
  capacity = 'micro';
}
```

## Estrutura de Configuração

### Seções Principais

1. **Overview**: Descrição geral do projeto
2. **System Architecture**: Arquitetura técnica detalhada
3. **Key Components**: Componentes principais
4. **Enterprise API System**: APIs organizadas por tier
5. **Data Flow**: Fluxos de dados principais
6. **External Dependencies**: Dependências externas
7. **User Preferences**: Preferências do usuário
8. **Development Rules**: Regras de desenvolvimento
9. **Recent Changes**: Mudanças recentes
10. **Operações Enterprise**: Operações por capacidade

### Exemplo de Configuração

```markdown
## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Foundation Setup**: Sistema criado usando duEuler Foundation v3.0 (29/06/2025)
- **Capacidade Enterprise**: Implementados todos os 69 APIs para 1M+ usuários
- **Kubernetes Native**: GitOps completo com ArgoCD/Flux implementado
```

## Manutenção do replit.md

### Quando Atualizar

1. **Mudanças arquiteturais**: Adição/remoção de componentes
2. **Preferências do usuário**: Mudanças de estilo ou processo
3. **Marcos importantes**: Implementação de novos tiers
4. **Decisões técnicas**: Escolhas importantes de tecnologia

### Como Atualizar

1. **Automático**: Scripts detectam e atualizam automaticamente
2. **Manual**: Edição direta das seções relevantes
3. **Via commands**: Usando comandos específicos da foundation

### Exemplo de Atualização Automática

```javascript
// Adicionar mudança recente
const newChange = `- **${feature}**: ${description} (${date})`;
addToRecentChanges(newChange);

// Atualizar capacidade
updateCapacity('enterprise');

// Registrar preferência
updateUserPreference('communication', 'technical detailed');
```

## Boas Práticas

### 1. Mantenha Atualizado
- Atualize imediatamente após mudanças importantes
- Use scripts automatizados quando possível
- Documente decisões técnicas relevantes

### 2. Seja Específico
- Use datas nas mudanças recentes
- Inclua métricas concretas (número de APIs, usuários suportados)
- Detalhe procedimentos operacionais

### 3. Organize por Prioridade
- Mudanças mais recentes no topo
- Informações mais relevantes primeiro
- Mantenha histórico para contexto

### 4. Validação
- Verifique se todos os placeholders foram substituídos
- Confirme que as informações estão corretas
- Teste scripts de configuração regularmente

## Troubleshooting

### Problemas Comuns

1. **Template não encontrado**
   ```bash
   # Verificar se existe
   ls dueuler-foundation/templates/replit.md.template
   ```

2. **Placeholders não substituídos**
   ```bash
   # Verificar placeholders restantes
   grep "{{" replit.md
   ```

3. **Detecção incorreta de capacidade**
   ```bash
   # Forçar capacidade específica
   node setup-replit-md.cjs --capacity enterprise
   ```

### Validação

```bash
# Validar configuração
node dueuler-foundation/automation/validator.cjs --check-replit-md

# Verificar consistência
grep -E "({{|})})" replit.md || echo "Configuração válida"
```

## Integração com Foundation

### Scripts Relacionados

- `setup-replit-md.cjs`: Configuração principal
- `validator.cjs`: Validação de configuração
- `upgrader.cjs`: Upgrade de capacidade
- `exporter.cjs`: Export de configurações

### Arquivos de Configuração

- `templates/replit.md.template`: Template principal
- `configs/*/config.json`: Configurações por capacidade
- `automation/`: Scripts de automação

## Conclusão

O sistema de configuração do `replit.md` garante que:
- Novos projetos herdem as melhores práticas
- Configurações sejam consistentes entre projetos
- Documentação permaneça atualizada automaticamente
- Contexto seja preservado entre sessões

Use os scripts fornecidos para automatizar o processo e manter a consistência em todos os projetos da foundation.