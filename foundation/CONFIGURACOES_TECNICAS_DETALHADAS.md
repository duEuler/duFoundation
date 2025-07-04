# Foundation v3.0 - Configurações Técnicas Detalhadas

## 🔧 Configurações Avançadas do Sistema

Este documento fornece configurações técnicas detalhadas para customização avançada, otimização de performance e integração empresarial do Foundation v3.0.

---

## 📊 Configurações de Capacidade

### **Configuração por Tier**

#### **NANO (1-100 usuários)**
```json
{
  "capacity": "nano",
  "resources": {
    "memory": "512MB",
    "cpu": "1 core",
    "connections": 50,
    "concurrency": 10
  },
  "database": {
    "pool_size": 5,
    "timeout": 30000,
    "idle_timeout": 60000
  },
  "cache": {
    "enabled": false,
    "ttl": 300
  }
}
```

#### **MICRO (100-1K usuários)**
```json
{
  "capacity": "micro",
  "resources": {
    "memory": "1GB",
    "cpu": "2 cores",
    "connections": 200,
    "concurrency": 50
  },
  "database": {
    "pool_size": 10,
    "timeout": 25000,
    "idle_timeout": 120000
  },
  "cache": {
    "enabled": true,
    "ttl": 600,
    "max_size": "50MB"
  }
}
```

#### **SMALL (1K-10K usuários)**
```json
{
  "capacity": "small",
  "resources": {
    "memory": "2GB",
    "cpu": "2 cores",
    "connections": 1000,
    "concurrency": 100
  },
  "database": {
    "pool_size": 20,
    "timeout": 20000,
    "idle_timeout": 180000
  },
  "cache": {
    "enabled": true,
    "ttl": 900,
    "max_size": "200MB"
  },
  "monitoring": {
    "metrics_interval": 30,
    "alert_thresholds": {
      "memory": 80,
      "cpu": 75,
      "connections": 90
    }
  }
}
```

#### **LARGE (10K-100K usuários)**
```json
{
  "capacity": "large",
  "resources": {
    "memory": "4GB",
    "cpu": "4 cores",
    "connections": 5000,
    "concurrency": 500
  },
  "database": {
    "pool_size": 50,
    "timeout": 15000,
    "idle_timeout": 300000,
    "read_replicas": 2
  },
  "cache": {
    "enabled": true,
    "ttl": 1800,
    "max_size": "1GB",
    "redis_enabled": true
  },
  "monitoring": {
    "metrics_interval": 15,
    "detailed_logging": true,
    "alert_thresholds": {
      "memory": 85,
      "cpu": 80,
      "connections": 95
    }
  },
  "load_balancing": {
    "enabled": true,
    "algorithm": "round_robin",
    "health_check_interval": 10
  }
}
```

#### **ENTERPRISE (100K+ usuários)**
```json
{
  "capacity": "enterprise",
  "resources": {
    "memory": "8GB",
    "cpu": "8 cores",
    "connections": 20000,
    "concurrency": 2000
  },
  "database": {
    "pool_size": 100,
    "timeout": 10000,
    "idle_timeout": 600000,
    "read_replicas": 4,
    "sharding_enabled": true
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "max_size": "4GB",
    "redis_cluster": true,
    "compression": true
  },
  "monitoring": {
    "metrics_interval": 5,
    "detailed_logging": true,
    "profiling_enabled": true,
    "alert_thresholds": {
      "memory": 90,
      "cpu": 85,
      "connections": 98
    }
  },
  "load_balancing": {
    "enabled": true,
    "algorithm": "weighted_round_robin",
    "health_check_interval": 5,
    "auto_scaling": true
  },
  "security": {
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 1000,
      "burst_limit": 100
    },
    "encryption": {
      "at_rest": true,
      "in_transit": true,
      "key_rotation": 30
    }
  }
}
```

---

## 🗄️ Configurações de Banco de Dados

### **PostgreSQL Avançado**

#### **Conexão e Pool**
```typescript
// drizzle.config.ts - Configuração Avançada
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'foundation',
    table: '__drizzle_migrations__',
    schema: 'public'
  }
});
```

#### **Pool de Conexões Otimizado**
```typescript
// server/db.ts - Pool Avançado
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: getCapacityConfig().database.pool_size,
  idleTimeoutMillis: getCapacityConfig().database.idle_timeout,
  connectionTimeoutMillis: getCapacityConfig().database.timeout,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Configurações avançadas
  statement_timeout: 30000,
  query_timeout: 25000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema, logger: true });

// Health check do banco
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1');
    return result.rows.length === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
```

### **Índices e Otimizações**

```sql
-- Índices recomendados para performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_sessions_expires ON sessions(expires_at);
CREATE INDEX CONCURRENTLY idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX CONCURRENTLY idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

-- Configurações PostgreSQL recomendadas
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

SELECT pg_reload_conf();
```

---

## 🚀 Configurações de Performance

### **Otimizações de Servidor**

#### **Express.js Avançado**
```typescript
// server/index.ts - Configuração Otimizada
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware de performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Segurança avançada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting baseado na capacidade
const rateLimitConfig = getCapacityConfig().security?.rate_limiting;
if (rateLimitConfig?.enabled) {
  app.use(rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: rateLimitConfig.requests_per_minute,
    burst: rateLimitConfig.burst_limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later'
    }
  }));
}

// Trust proxy para load balancers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
```

#### **Configurações de Cluster**
```typescript
// cluster.ts - Multi-process para LARGE/ENTERPRISE
import cluster from 'cluster';
import os from 'os';

const numWorkers = getCapacityConfig().resources.cpu;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} starting ${numWorkers} workers`);
  
  // Criar workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  // Restart workers que crasharam
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
  });
} else {
  // Worker process
  require('./server/index');
  console.log(`Worker ${process.pid} started`);
}
```

---

## 📊 Configurações de Monitoramento

### **Métricas Avançadas**

#### **Sistema de Métricas Customizado**
```typescript
// monitoring/metrics.ts
interface SystemMetrics {
  timestamp: Date;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load_average: number[];
  };
  database: {
    active_connections: number;
    query_time_avg: number;
    slow_queries: number;
  };
  cache: {
    hit_rate: number;
    memory_usage: number;
    evictions: number;
  };
  requests: {
    total: number;
    per_second: number;
    error_rate: number;
    response_time_avg: number;
  };
}

export class MetricsCollector {
  private metrics: SystemMetrics[] = [];
  private interval: NodeJS.Timeout;
  
  constructor(private config: CapacityConfig) {
    this.interval = setInterval(
      () => this.collectMetrics(),
      config.monitoring.metrics_interval * 1000
    );
  }
  
  private async collectMetrics(): Promise<void> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      memory: this.getMemoryMetrics(),
      cpu: this.getCpuMetrics(),
      database: await this.getDatabaseMetrics(),
      cache: this.getCacheMetrics(),
      requests: this.getRequestMetrics()
    };
    
    this.metrics.push(metrics);
    await this.storeMetrics(metrics);
    this.checkAlerts(metrics);
  }
  
  private checkAlerts(metrics: SystemMetrics): void {
    const thresholds = this.config.monitoring.alert_thresholds;
    
    if (metrics.memory.percentage > thresholds.memory) {
      this.sendAlert('memory', metrics.memory.percentage);
    }
    
    if (metrics.cpu.usage > thresholds.cpu) {
      this.sendAlert('cpu', metrics.cpu.usage);
    }
  }
}
```

#### **Logging Estruturado**
```typescript
// monitoring/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata()
  ),
  defaultMeta: {
    service: 'foundation-v3',
    version: '3.0.0',
    capacity: getCapacityConfig().capacity
  },
  transports: [
    // Console para desenvolvimento
    ...(isDevelopment ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : []),
    
    // Arquivo para produção
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});
```

---

## 🔒 Configurações de Segurança

### **Autenticação e Autorização Avançada**

#### **Configuração de Sessão Segura**
```typescript
// auth/session.ts
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { pool } from '../db';

const PgSession = ConnectPgSimple(session);

export const sessionConfig = {
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15, // 15 minutos
  }),
  
  secret: process.env.SESSION_SECRET || generateSecureSecret(),
  resave: false,
  saveUninitialized: false,
  
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
  },
  
  // Configurações avançadas por capacidade
  ...(getCapacityConfig().capacity === 'enterprise' && {
    rolling: true,
    proxy: true,
    cookie: {
      ...sessionConfig.cookie,
      secure: true,
      maxAge: 8 * 60 * 60 * 1000 // 8 horas para enterprise
    }
  })
};

function generateSecureSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production');
  }
  return require('crypto').randomBytes(64).toString('hex');
}
```

#### **Middleware de Autorização**
```typescript
// auth/middleware.ts
export const authorize = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(user.role, requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

function hasPermission(userRole: string, requiredRole: string): boolean {
  const hierarchy = ['user', 'manager', 'admin'];
  const userLevel = hierarchy.indexOf(userRole);
  const requiredLevel = hierarchy.indexOf(requiredRole);
  
  return userLevel >= requiredLevel;
}
```

---

## 🌐 Configurações de Deploy

### **Variáveis de Ambiente**

#### **Arquivo .env.example**
```bash
# Foundation v3.0 - Configurações de Ambiente

# Configuração Principal
NODE_ENV=production
PORT=5000
FOUNDATION_CAPACITY=large

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/foundation
DB_POOL_SIZE=50
DB_TIMEOUT=15000

# Segurança
SESSION_SECRET=sua_chave_secreta_muito_forte_aqui
BCRYPT_ROUNDS=12
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000

# Cache (Redis para LARGE/ENTERPRISE)
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800
CACHE_MAX_SIZE=1GB

# Monitoramento
METRICS_INTERVAL=15
ALERT_EMAIL=admin@empresa.com
LOG_LEVEL=info
PROFILING_ENABLED=false

# Load Balancer (ENTERPRISE)
LOAD_BALANCER_ENABLED=true
HEALTH_CHECK_INTERVAL=5
AUTO_SCALING=true

# Integração Externa
WEBHOOK_URL=https://api.empresa.com/webhook
API_TIMEOUT=10000
```

#### **Docker Compose para Deploy**
```yaml
# docker-compose.yml
version: '3.8'

services:
  foundation:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - FOUNDATION_CAPACITY=large
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 4G
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: foundation
      POSTGRES_USER: foundation_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 1gb

volumes:
  postgres_data:
  redis_data:
```

---

## ⚡ Scripts de Automação

### **Scripts de Gestão Avançada**

#### **health-check.cjs**
```javascript
#!/usr/bin/env node

// Verificação completa de saúde do sistema
const http = require('http');
const { exec } = require('child_process');

async function healthCheck() {
  const checks = [
    checkServer(),
    checkDatabase(),
    checkRedis(),
    checkDiskSpace(),
    checkMemory()
  ];
  
  const results = await Promise.allSettled(checks);
  const failures = results.filter(r => r.status === 'rejected');
  
  if (failures.length > 0) {
    console.error('Health check failed:', failures);
    process.exit(1);
  }
  
  console.log('✅ All health checks passed');
  process.exit(0);
}

async function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      res.statusCode === 200 ? resolve() : reject('Server not responding');
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject('Server timeout'));
  });
}

healthCheck();
```

#### **capacity-upgrade.cjs**
```javascript
#!/usr/bin/env node

// Script para upgrade automático de capacidade
const fs = require('fs');
const path = require('path');

async function upgradeCapacity(newCapacity) {
  console.log(`🔄 Upgrading to ${newCapacity} capacity...`);
  
  // 1. Backup configuração atual
  await backupCurrentConfig();
  
  // 2. Aplicar nova configuração
  await applyNewCapacity(newCapacity);
  
  // 3. Reiniciar serviços necessários
  await restartServices();
  
  // 4. Verificar saúde do sistema
  await runHealthCheck();
  
  console.log(`✅ Successfully upgraded to ${newCapacity} capacity`);
}

async function backupCurrentConfig() {
  const configPath = 'foundation/foundation.config.json';
  const backupPath = `foundation/config-backup-${Date.now()}.json`;
  
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
    console.log(`📦 Config backed up to ${backupPath}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const newCapacity = process.argv[2];
  if (!newCapacity) {
    console.error('Usage: node capacity-upgrade.cjs <capacity>');
    process.exit(1);
  }
  
  upgradeCapacity(newCapacity).catch(console.error);
}
```

---

*Foundation v3.0 - Configurações técnicas detalhadas atualizadas em 4 de Julho de 2025*