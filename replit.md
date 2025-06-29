# DuEuler Foundation Management System

## Overview

This is a full-stack web application for the DuEuler Foundation, built as a management system with user authentication, role-based access control, and real-time metrics monitoring. The application follows a monorepo structure with separated client and server code, utilizing modern web technologies for both frontend and backend development.

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
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```