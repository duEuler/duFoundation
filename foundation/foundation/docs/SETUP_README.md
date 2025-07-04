<!-- REVISAR-ORFAO: Esta pasta foundation/foundation/ parece ser duplicada ou órfã -->
# DuEuler Foundation v3.0 - Setup Inicial

Este é o instalador mínimo do DuEuler Foundation. O sistema inicia apenas com o componente de Setup, que permite configurar e ativar o sistema completo.

## Estrutura Inicial

- **Setup Component**: Interface para configuração inicial
- **Schema Mínimo**: Apenas tabelas essenciais para setup
- **Routes Básicas**: Apenas rotas de setup

## Processo de Instalação

1. **Setup Inicial**: Usuário acessa /foundation/setup
2. **Configuração**: Define parâmetros do sistema
3. **Ativação**: Sistema carrega componentes completos
4. **Redirecionamento**: Usuário é direcionado para dashboard

## Próximos Passos

Após a configuração inicial, o sistema carregará automaticamente:
- Dashboard completo
- Páginas de dependências e capacidades  
- Componentes de monitoramento
- Sistema de autenticação completo

## Comandos

```bash
# Instalar dependências
npm install

# Executar desenvolvimento
npm run dev

# Executar setup do banco
npm run db:push
```