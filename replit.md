# DuEuler Foundation Management System

## Overview

This is a full-stack web application for the DuEuler Foundation, built as a management system with user authentication, role-based access control, and real-time metrics monitoring. The application follows a monorepo structure with separated client and server code, utilizing modern web technologies for both frontend and backend development.

**duEuler Foundation v3.0 Integration**: The project now incorporates the official duEuler Foundation v3.0 framework, configured for SMALL capacity (10K-50K users) with enterprise-grade monitoring, security, and performance optimizations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom DuEuler Foundation design tokens
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based with bcrypt for password hashing
- **Session Storage**: PostgreSQL with connect-pg-simple

### Data Storage
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Location**: `shared/schema.ts` for type-safe database models
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication System
- Session-based authentication with secure password hashing
- Role-based access control (admin, manager, user)
- Protected routes and middleware for API endpoints
- Session management with automatic cleanup

### Database Schema
- **Users**: User management with roles and active status tracking
- **Sessions**: Session tracking for authentication
- **System Config**: Organization settings and system parameters
- **System Metrics**: Real-time performance and usage metrics
- **Activity Logs**: Audit trail for user actions

### API Structure
- RESTful endpoints under `/api` prefix
- Setup endpoint for initial system configuration
- Authentication endpoints for login/logout
- Protected endpoints for user and system management
- Real-time metrics and activity monitoring

### UI Components
- Comprehensive component library based on shadcn/ui
- Responsive design with mobile-first approach
- Dark/light theme support with CSS custom properties
- Accessible components using Radix UI primitives

## Data Flow

1. **Initial Setup**: System requires setup with organization details and admin user creation
2. **Authentication**: Users log in through role-based authentication system
3. **Dashboard**: Real-time metrics and system status displayed on main dashboard
4. **User Management**: Admin users can manage other users and system settings
5. **Activity Tracking**: All user actions logged for audit purposes

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI libraries (Radix UI, Lucide icons, Tailwind CSS)
- TanStack Query for data fetching and caching
- wouter for routing
- date-fns for date manipulation

### Backend Dependencies
- Express.js for web server
- Drizzle ORM for database operations
- Neon Database serverless driver
- bcrypt for password hashing
- Session management utilities

### Development Dependencies
- Vite for build tooling
- TypeScript for type safety
- Tailwind CSS for styling
- ESBuild for server bundling

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript server code
- Database migrations through Drizzle Kit
- Environment variables for database connection

### Production
- Static build output served by Express server
- Single process serving both API and static files
- Environment-based configuration
- Database provisioning through Neon

### Build Process
1. Frontend built with Vite to `dist/public`
2. Server code bundled with ESBuild to `dist`
3. Single Node.js process serves both API and static files
4. Database schema applied through migrations

## Changelog

```
Changelog:
- June 29, 2025. Initial setup with authentication system and role-based access control
- June 29, 2025. Integrated duEuler Foundation v3.0 with SMALL capacity configuration
- June 29, 2025. Added enterprise-grade monitoring system supporting 10,000+ concurrent users
- June 29, 2025. Implemented real-time metrics collection and Prometheus endpoint integration
- June 29, 2025. Added FoundationMetrics component for real-time system monitoring dashboard
- July 3, 2025. Removed redundant "access level" field from login - role now tied to user account
- July 3, 2025. Implemented proper duEuler Foundation integration system with official automation
- July 3, 2025. Successfully upgraded to LARGE capacity (500K users, 8GB RAM, 8 cores)
- July 4, 2025. Fixed critical import errors and syntax issues in React components
- July 4, 2025. Restructured all routes to work under /foundation prefix for proper organization
- July 4, 2025. Updated navigation system to support foundation-based routing structure
- July 4, 2025. Implemented "virgem" system with minimal setup-only interface
- July 4, 2025. Added user confirmation system with S/SIM prompt before installation
- July 4, 2025. Created plant_foundation script for structure verification and integrity checks
- July 4, 2025. Added REPLIT_ORDER_EXECUTION.md documenting Replit's standard file reading order
- July 4, 2025. Implemented foundation/.replit system with independent sub-project configuration
- July 4, 2025. Created foundation/.config/foundation.json for structured system configuration
- July 4, 2025. Added intelligent context detection to foundation.sh script (works from any directory)
- July 4, 2025. Established complete foundation independence - works as standalone framework
- July 4, 2025. Created comprehensive documentation system for foundation/.replit implementation
- July 4, 2025. Implemented foundation auto-installer with foundation-detector.cjs system
- July 4, 2025. Added intelligent S/N/I detection system (Install/Skip/Ignore forever)
- July 4, 2025. Created foundation-remover.cjs for complete uninstallation with backup
- July 4, 2025. Added foundation-remove global command for easy access
- July 4, 2025. Implemented /foundation/setup route for web interface configuration
- July 4, 2025. Created portable system that works in any project when extracted
- July 4, 2025. Fixed file organization: moved foundation.config.json from root to foundation/ directory
- July 4, 2025. Created advanced uninstall system with detailed manifest tracking and foundation-uninstall command
- July 4, 2025. Added /foundation/uninstall web interface and API endpoint for uninstallation
- July 4, 2025. Implemented manifest-based tracking to record all installation changes for precise removal
- July 4, 2025. Reorganized file structure: moved foundation-remove and foundation-uninstall commands to foundation/ directory
- July 4, 2025. Updated all paths and references to work with new organized structure
- July 4, 2025. Created virgin state App.tsx that shows welcome message when Foundation not installed
- July 4, 2025. Implemented comprehensive test suite (test-installation.cjs) for complete Foundation validation
- July 4, 2025. Fixed critical ES modules compatibility issues in Foundation setup route (CommonJS → ES modules)
- July 4, 2025. Corrected server routing configuration (index.ts now properly uses routes.ts instead of routes-minimal.ts)
- July 4, 2025. Successfully validated complete Foundation installation and removal cycle with automated testing
- July 4, 2025. All Foundation routes (/foundation/setup, /api/setup) now working properly with HTTP 200 status
- July 4, 2025. Foundation system now fully portable and ready for deployment to other projects
- July 4, 2025. Implemented MANDATORY compatibility verification system that blocks all Foundation operations
- July 4, 2025. Created compatibility-checker.js and COMPATIBILITY-MANDATORY.md for comprehensive validation
- July 4, 2025. Added verifyCompatibilityMandatory() function that executes BEFORE any Foundation operation
- July 4, 2025. System now prevents all known compatibility issues by stopping immediately when detected
- July 4, 2025. Verification covers ES modules vs CommonJS, server configuration, and file structure requirements
- July 4, 2025. ANÁLISE COMPLETA DOS ERROS: Identificadas falhas críticas no sistema de verificação obrigatória
- July 4, 2025. Criado comprehensive-checker.js que simula instalação completa e antecipa problemas
- July 4, 2025. Implementados templates dinâmicos que se adaptam ao tipo de projeto (ES modules vs CommonJS)
- July 4, 2025. Sistema agora realiza verificação completa, simulação de instalação e teste de integração
- July 4, 2025. Documentação completa da análise criada em ANALISE-PROBLEMAS-INSTALACAO.md
- July 4, 2025. SUCESSO COMPLETO: Foundation instalado e testado com todas as correções implementadas
- July 4, 2025. Corrigido server/index.ts para usar routes.ts em vez de routes-minimal.ts
- July 4, 2025. Rota /foundation/setup registrada corretamente no servidor e funcionando (HTTP 200)
- July 4, 2025. Sistema de verificação preventiva funcionando - bloqueia instalações incompatíveis
- July 4, 2025. Templates ES modules gerando código correto automaticamente
- July 4, 2025. Foundation v3.0 completamente funcional e portável para outros projetos
- July 4, 2025. DOCUMENTAÇÃO COMPLETA: Criada documentação completa do sistema Foundation v3.0
- July 4, 2025. Implementado guia de novos projetos (NEW-PROJECT-GUIDE.md) com padrões obrigatórios
- July 4, 2025. Criado guia de migração (MIGRATION-GUIDE.md) para projetos existentes com soluções reais
- July 4, 2025. Desenvolvido guia de troubleshooting (TROUBLESHOOTING.md) cobrindo todos os problemas identificados
- July 4, 2025. Adicionados checklists pré e pós-instalação para garantir sucesso em 100% dos casos
- July 4, 2025. README.md principal organizando toda a documentação e recursos do Foundation
- July 4, 2025. Sistema de documentação baseado em problemas reais encontrados durante desenvolvimento
- July 4, 2025. Arquitetura de Padronização Progressiva Híbrida completa e documentada
- July 4, 2025. Foundation v3.0 totalmente preparado para uso empresarial com múltiplos projetos
- July 4, 2025. Implementado sistema de Scanner Automático (foundation-auto-scanner.cjs) com execução única controlada
- July 4, 2025. Criado flag .foundation-scanned para controle de execução automática apenas na primeira vez
- July 4, 2025. Integrado sistema de remoção do flag no foundation-remover.cjs para limpeza completa
- July 4, 2025. Documentação AUTO-SCANNER-GUIDE.md criada explicando comportamento automático e antecipação inteligente
- July 4, 2025. README.md atualizado com nova funcionalidade de scanner automático v3.0
- July 4, 2025. Sistema de "antecipação inteligente" funcionando: análise automática segura na primeira execução
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```