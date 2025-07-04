# Regras do Sistema DuEuler Foundation

## Regras de Desenvolvimento

### 1. Arquitetura e Estrutura
- **Capacidade Máxima**: Sistema deve suportar até 10.000 usuários simultâneos
- **Hierarquia de Usuários**: Admin > Gerente > Usuário (com heranças de permissões)
- **Segurança**: Autenticação baseada em sessões com bcrypt para senhas
- **Database**: PostgreSQL com Drizzle ORM - NUNCA usar comandos SQL destrutivos sem autorização expressa

### 2. Regras de Negócio
- **Setup Inicial**: Senha fixa "dueuler2024" para configuração inicial
- **Roles e Permissões**:
  - **Admin**: Acesso completo ao sistema, gestão de usuários, configurações
  - **Gerente**: Relatórios, gestão de equipe, projetos
  - **Usuário**: Dashboard básico, perfil, notificações
- **Sessões**: Expiração automática em 24 horas
- **Métricas**: Atualizações em tempo real a cada 30 segundos

### 3. Regras de Interface
- **Design System**: Cores DuEuler Foundation (azul primário #3B82F6)
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: Componentes Radix UI para padrões WCAG
- **Menu Lateral**: Hierárquico baseado no role do usuário

### 4. Regras de Segurança
- **Validação**: Todos os inputs validados com Zod schemas
- **Autorização**: Middleware de autenticação em todas as rotas protegidas
- **Logs**: Todas as ações importantes registradas em activity_logs
- **Rate Limiting**: Prevenção contra ataques de força bruta

### 5. Regras de Performance
- **Cache**: TTL configurável (padrão 300 segundos)
- **Queries**: Otimizadas com índices e paginação
- **Real-time**: WebSocket para atualizações críticas
- **Lazy Loading**: Componentes carregados sob demanda

### 6. Regras de Manutenção
- **Backup**: Dados críticos com backup automático
- **Logs**: Rotação automática para evitar sobrecarga
- **Monitoring**: Métricas de sistema e alertas
- **Updates**: Zero-downtime deployments

### 7. Regras de Desenvolvimento
- **TypeScript**: Tipagem forte obrigatória
- **Code Quality**: ESLint + Prettier configurados
- **Testing**: Testes unitários para funções críticas
- **Documentation**: Código autodocumentado com JSDoc

### 8. Regras de Compliance
- **LGPD**: Proteção de dados pessoais
- **Auditoria**: Trilha completa de ações
- **Retenção**: Políticas de retenção de dados configuráveis
- **Backup**: Estratégia 3-2-1 para dados críticos

## Configurações Técnicas

### Environment Variables Required:
- `DATABASE_URL`: String de conexão PostgreSQL
- `NODE_ENV`: development | staging | production
- `SESSION_SECRET`: Chave para criptografia de sessões

### Dependency Rules:
- **Frontend**: React 18+ com TypeScript
- **Backend**: Node.js 18+ com Express
- **Database**: PostgreSQL 14+ com Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS

### Performance Targets:
- **Load Time**: < 2 segundos para primeira renderização
- **API Response**: < 200ms para operações básicas
- **Concurrent Users**: Até 10.000 usuários simultâneos
- **Uptime**: 99.9% de disponibilidade

## Proibições

### ❌ NUNCA FAZER:
1. Usar dados mock ou sintéticos sem autorização
2. Expor senhas ou tokens em logs
3. Modificar estruturas de banco sem migração
4. Ignorar validações de entrada
5. Fazer deploy sem testes
6. Usar localStorage para dados sensíveis
7. Implementar funcionalidades sem autorização adequada
8. Quebrar a hierarquia de roles estabelecida

### ✅ SEMPRE FAZER:
1. Validar todas as entradas com Zod
2. Registrar ações importantes em logs
3. Usar middleware de autenticação em rotas protegidas
4. Implementar rate limiting em endpoints críticos
5. Manter documentação atualizada
6. Seguir padrões de nomenclatura estabelecidos
7. Testar funcionalidades antes do deploy
8. Respeitar limites de roles e permissões