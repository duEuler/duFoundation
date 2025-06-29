import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import os from 'os';

interface SystemMetrics {
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  memory_total: number;
  active_connections: number;
  request_count: number;
  error_count: number;
  response_time_avg: number;
  user_sessions: number;
}

interface MetricValue {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

class MonitoringService {
  private metrics: Map<string, MetricValue[]> = new Map();
  private systemStats = {
    startTime: Date.now(),
    totalRequests: 0,
    totalErrors: 0,
    activeConnections: 0,
    responseTimes: [] as number[],
    activeSessions: 0
  };

  constructor() {
    this.initializeMetrics();
    this.startSystemCollection();
  }

  private initializeMetrics(): void {
    const metricNames = [
      'http_requests_total',
      'http_request_duration_ms',
      'system_cpu_usage',
      'system_memory_usage',
      'active_connections',
      'user_sessions_active',
      'database_connections',
      'error_rate'
    ];

    metricNames.forEach(name => {
      this.metrics.set(name, []);
    });
  }

  private startSystemCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Coleta a cada 30 segundos conforme configuração SMALL
  }

  private collectSystemMetrics(): void {
    const now = Date.now();
    
    // CPU Usage (simulado - em produção usaria bibliotecas específicas)
    const cpuUsage = Math.min(95, Math.random() * 100);
    this.recordMetric('system_cpu_usage', cpuUsage);

    // Memory Usage
    const memUsed = process.memoryUsage();
    const totalMem = os.totalmem();
    const memoryUsage = (memUsed.heapUsed / totalMem) * 100;
    this.recordMetric('system_memory_usage', memoryUsage);

    // Active connections
    this.recordMetric('active_connections', this.systemStats.activeConnections);

    // User sessions
    this.recordMetric('user_sessions_active', this.systemStats.activeSessions);

    // Average response time
    if (this.systemStats.responseTimes.length > 0) {
      const avgResponseTime = this.systemStats.responseTimes.reduce((a, b) => a + b, 0) / this.systemStats.responseTimes.length;
      this.recordMetric('http_request_duration_ms', avgResponseTime);
      
      // Limpa response times antigos
      if (this.systemStats.responseTimes.length > 1000) {
        this.systemStats.responseTimes = this.systemStats.responseTimes.slice(-500);
      }
    }

    // Error rate
    const errorRate = this.systemStats.totalRequests > 0 ? 
      (this.systemStats.totalErrors / this.systemStats.totalRequests) * 100 : 0;
    this.recordMetric('error_rate', errorRate);
  }

  public recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const metric: MetricValue = {
      name,
      value,
      labels,
      timestamp: Date.now()
    };

    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    
    // Mantém apenas os últimos 1000 pontos de dados por métrica
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    
    this.metrics.set(name, existing);
  }

  public recordRequest(responseTime: number): void {
    this.systemStats.totalRequests++;
    this.systemStats.responseTimes.push(responseTime);
    this.recordMetric('http_requests_total', this.systemStats.totalRequests);
  }

  public recordError(): void {
    this.systemStats.totalErrors++;
  }

  public recordConnection(delta: number): void {
    this.systemStats.activeConnections = Math.max(0, this.systemStats.activeConnections + delta);
  }

  public recordUserSession(delta: number): void {
    this.systemStats.activeSessions = Math.max(0, this.systemStats.activeSessions + delta);
  }

  public getLatestMetrics(): SystemMetrics {
    const now = Date.now();
    const uptime = (now - this.systemStats.startTime) / 1000;
    
    return {
      timestamp: now,
      cpu_usage: this.getLatestValue('system_cpu_usage') || 0,
      memory_usage: this.getLatestValue('system_memory_usage') || 0,
      memory_total: os.totalmem(),
      active_connections: this.systemStats.activeConnections,
      request_count: this.systemStats.totalRequests,
      error_count: this.systemStats.totalErrors,
      response_time_avg: this.getLatestValue('http_request_duration_ms') || 0,
      user_sessions: this.systemStats.activeSessions
    };
  }

  private getLatestValue(metricName: string): number | null {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return null;
    return metrics[metrics.length - 1].value;
  }

  public getMetricsHistory(metricName: string, timeRange: number = 3600000): MetricValue[] {
    const metrics = this.metrics.get(metricName) || [];
    const cutoff = Date.now() - timeRange;
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  public exportPrometheusMetrics(): string {
    let output = '';
    
    this.metrics.forEach((values, name) => {
      if (values.length === 0) return;
      
      const latest = values[values.length - 1];
      const metricType = this.getMetricType(name);
      
      output += `# HELP ${name} ${this.getMetricHelp(name)}\n`;
      output += `# TYPE ${name} ${metricType}\n`;
      
      if (latest.labels) {
        const labelStr = Object.entries(latest.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        output += `${name}{${labelStr}} ${latest.value} ${latest.timestamp}\n`;
      } else {
        output += `${name} ${latest.value} ${latest.timestamp}\n`;
      }
      output += '\n';
    });
    
    return output;
  }

  private getMetricType(name: string): string {
    if (name.includes('total') || name.includes('count')) return 'counter';
    if (name.includes('duration') || name.includes('time')) return 'histogram';
    return 'gauge';
  }

  private getMetricHelp(name: string): string {
    const helpTexts: Record<string, string> = {
      'http_requests_total': 'Total number of HTTP requests',
      'http_request_duration_ms': 'HTTP request duration in milliseconds',
      'system_cpu_usage': 'System CPU usage percentage',
      'system_memory_usage': 'System memory usage percentage',
      'active_connections': 'Number of active connections',
      'user_sessions_active': 'Number of active user sessions',
      'database_connections': 'Number of database connections',
      'error_rate': 'Application error rate percentage'
    };
    return helpTexts[name] || `Metric: ${name}`;
  }

  public getHealthStatus(): { status: string; details: any } {
    const metrics = this.getLatestMetrics();
    const health = {
      status: 'healthy',
      details: {
        uptime: (Date.now() - this.systemStats.startTime) / 1000,
        cpu_usage: metrics.cpu_usage,
        memory_usage: metrics.memory_usage,
        active_connections: metrics.active_connections,
        response_time: metrics.response_time_avg,
        error_rate: metrics.error_count > 0 ? (metrics.error_count / metrics.request_count) * 100 : 0
      }
    };

    // Determina status baseado nos thresholds da configuração SMALL
    if (metrics.cpu_usage > 80 || metrics.memory_usage > 85 || metrics.response_time_avg > 500) {
      health.status = 'degraded';
    }

    if (metrics.cpu_usage > 95 || metrics.memory_usage > 95 || metrics.response_time_avg > 2000) {
      health.status = 'unhealthy';
    }

    return health;
  }
}

// Middleware para monitoramento automático de requisições
export function createMonitoringMiddleware(monitoringService: MonitoringService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    monitoringService.recordConnection(1);
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      monitoringService.recordRequest(responseTime);
      monitoringService.recordConnection(-1);
      
      if (res.statusCode >= 400) {
        monitoringService.recordError();
      }
    });
    
    next();
  };
}

export const monitoringService = new MonitoringService();
export { MonitoringService, SystemMetrics, MetricValue };