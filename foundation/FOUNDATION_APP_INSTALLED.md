# FOUNDATION APP INSTALAÇÃO

## Informações da Instalação

- **Version:** 3.0
- **Date:** 2025-07-04T03:45:24.672Z
- **Installer:** Foundation App Installer v3.0
- **Location:** foundation/_app/

## Estrutura Instalada

- Frontend React em `foundation/_app/client/`
- Backend Node.js em `foundation/_app/server/`
- Modelos de dados em `foundation/_app/shared/`
- Configurações em `foundation/_app/config/`

## Rotas Foundation

- `/foundation/` → Dashboard principal
- `/foundation/login` → Autenticação
- `/foundation/setup` → Configuração inicial
- `/foundation/capacities` → Gestão de capacidades
- `/foundation/dependencies` → Gestão de dependências

## Comandos Úteis

### Instalar dependências:
```bash
cd foundation/_app && npm install
```

### Executar aplicação:
```bash
cd foundation/_app && npm run dev
```

### Executar migrações:
```bash
cd foundation/_app && npm run db:push
```

## Migração para Outro Projeto

1. Copie toda a pasta `foundation/` para o novo projeto
2. Execute: `node foundation/foundation-installer.cjs`
3. Configure variáveis de ambiente necessárias
4. Execute: `npm install` na pasta `foundation/_app/`
