/**
 * Prometheus Service - Sistema de Métricas Avançado
 * Implementa coleta, agregação e exposição de métricas personalizadas
 * 
 * Funcionalidades:
 * - Métricas de aplicação (counters, gauges, histograms)
 * - Métricas de sistema (CPU, memória, rede)
 * - Métricas customizadas por domínio
 * - Exportação no formato Prometheus
 */

import { Request, Response } from 'express';

export interface MetricConfig {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels?: string[];
}

export interface MetricValue {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

export interface SystemMetrics {
  cpu_usage_percent: number;
  memory_usage_bytes: number;
  memory_total_bytes: number;
  disk_usage_bytes: number;
  disk_total_bytes: number;
  network_bytes_sent: number;
  network_bytes_received: number;
  active_connections: number;
  request_count: number;
  error_count: number;
  response_time_ms: number;
}

export interface ApplicationMetrics {
  http_requests_total: number;
  http_request_duration_ms: number;
  database_connections_active: number;
  database_query_duration_ms: number;
  cache_hits_total: number;
  cache_misses_total: number;
  user_sessions_active: number;
  errors_total: number;
  business_events_total: number;
}

export class PrometheusService {
  private metrics: Map<string, MetricValue[]> = new Map();
  private metricConfigs: Map<string, MetricConfig> = new Map();
  private systemStats = {
    startTime: Date.now(),
    totalRequests: 0,
    totalErrors: 0,
    activeConnections: 0,
    responseTimes: [] as number[]
  };

  constructor() {
    this.initializeDefaultMetrics();
    this.startSystemMetricsCollection();
  }

  /**
   * Inicializa métricas padrão do sistema
   */
  private initializeDefaultMetrics(): void {
    const defaultMetrics: MetricConfig[] = [
      { name: 'http_requests_total', help: 'Total HTTP requests', type: 'counter', labels: ['method', 'status', 'endpoint'] },
      { name: 'http_request_duration_ms', help: 'HTTP request duration in milliseconds', type: 'histogram', labels: ['method', 'endpoint'] },
      { name: 'system_cpu_usage_percent', help: 'CPU usage percentage', type: 'gauge' },
      { name: 'system_memory_usage_bytes', help: 'Memory usage in bytes', type: 'gauge' },
      { name: 'system_memory_total_bytes', help: 'Total memory in bytes', type: 'gauge' },
      { name: 'system_disk_usage_bytes', help: 'Disk usage in bytes', type: 'gauge' },
      { name: 'database_connections_active', help: 'Active database connections', type: 'gauge' },
      { name: 'database_query_duration_ms', help: 'Database query duration', type: 'histogram' },
      { name: 'cache_operations_total', help: 'Cache operations', type: 'counter', labels: ['operation', 'result'] },
      { name: 'user_sessions_active', help: 'Active user sessions', type: 'gauge' },
      { name: 'business_events_total', help: 'Business events counter', type: 'counter', labels: ['event_type', 'status'] },
      { name: 'application_errors_total', help: 'Application errors', type: 'counter', labels: ['error_type', 'severity'] },
      { name: 'nodejs_process_uptime_seconds', help: 'Node.js process uptime', type: 'gauge' },
      { name: 'nodejs_heap_used_bytes', help: 'Node.js heap used', type: 'gauge' },
      { name: 'nodejs_heap_total_bytes', help: 'Node.js heap total', type: 'gauge' }
    ];

    defaultMetrics.forEach(config => {
      this.metricConfigs.set(config.name, config);
      this.metrics.set(config.name, []);
    });
  }

  /**
   * Inicia coleta automática de métricas do sistema
   */
  private startSystemMetricsCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 15000); // Coleta a cada 15 segundos

    // Coleta inicial
    this.collectSystemMetrics();
  }

  /**
   * Coleta métricas do sistema Node.js
   */
  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Métricas do processo Node.js
    this.setGauge('nodejs_process_uptime_seconds', uptime);
    this.setGauge('nodejs_heap_used_bytes', memUsage.heapUsed);
    this.setGauge('nodejs_heap_total_bytes', memUsage.heapTotal);

    // Métricas do sistema (simuladas para demo)
    this.setGauge('system_cpu_usage_percent', this.getCPUUsage());
    this.setGauge('system_memory_usage_bytes', memUsage.rss);
    this.setGauge('system_memory_total_bytes', memUsage.rss * 4); // Estimativa

    // Métricas de aplicação
    this.setGauge('user_sessions_active', this.systemStats.activeConnections);
    
    // Tempo médio de resposta dos últimos requests
    if (this.systemStats.responseTimes.length > 0) {
      const avgResponseTime = this.systemStats.responseTimes.reduce((a, b) => a + b, 0) / this.systemStats.responseTimes.length;
      this.setGauge('http_request_duration_ms', avgResponseTime);
      
      // Limpa array para próxima coleta
      this.systemStats.responseTimes = [];
    }
  }

  /**
   * Simula CPU usage (em ambiente real seria obtido do sistema)
   */
  private getCPUUsage(): number {
    return Math.random() * 100; // 0-100%
  }

  /**
   * Registra uma nova métrica customizada
   */
  public registerMetric(config: MetricConfig): void {
    this.metricConfigs.set(config.name, config);
    if (!this.metrics.has(config.name)) {
      this.metrics.set(config.name, []);
    }
  }

  /**
   * Incrementa um counter
   */
  public incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const existing = this.getMetricValue(name, labels);
    const newValue = (existing?.value || 0) + value;
    
    this.setMetricValue({
      name,
      value: newValue,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Define valor de um gauge
   */
  public setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.setMetricValue({
      name,
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Observa valor em histogram
   */
  public observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    // Para simplicidade, tratamos como gauge
    // Em implementação real, manteria buckets
    this.setGauge(name, value, labels);
  }

  /**
   * Registra tempo de execução de uma função
   */
  public async measureExecutionTime<T>(
    metricName: string,
    fn: () => Promise<T> | T,
    labels?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.observeHistogram(metricName, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.observeHistogram(metricName, duration, { ...labels, status: 'error' });
      throw error;
    }
  }

  /**
   * Middleware Express para métricas automáticas
   */
  public expressMiddleware() {
    return (req: Request, res: Response, next: Function) => {
      const startTime = Date.now();
      this.systemStats.totalRequests++;
      this.systemStats.activeConnections++;

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.systemStats.responseTimes.push(duration);
        this.systemStats.activeConnections--;

        // Registra métricas da requisição
        this.incrementCounter('http_requests_total', 1, {
          method: req.method,
          status: res.statusCode.toString(),
          endpoint: this.normalizeEndpoint(req.path)
        });

        this.observeHistogram('http_request_duration_ms', duration, {
          method: req.method,
          endpoint: this.normalizeEndpoint(req.path)
        });

        // Registra erros
        if (res.statusCode >= 400) {
          this.systemStats.totalErrors++;
          this.incrementCounter('application_errors_total', 1, {
            error_type: 'http_error',
            severity: res.statusCode >= 500 ? 'high' : 'medium'
          });
        }
      });

      next();
    };
  }

  /**
   * Normaliza endpoints para agrupamento (remove IDs)
   */
  private normalizeEndpoint(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-f0-9]{24}/g, '/:objectid');
  }

  /**
   * Obtém valor de métrica específica
   */
  private getMetricValue(name: string, labels?: Record<string, string>): MetricValue | undefined {
    const values = this.metrics.get(name) || [];
    return values.find(v => this.labelsMatch(v.labels, labels));
  }

  /**
   * Define valor de métrica
   */
  private setMetricValue(metric: MetricValue): void {
    const values = this.metrics.get(metric.name) || [];
    const existingIndex = values.findIndex(v => this.labelsMatch(v.labels, metric.labels));
    
    if (existingIndex >= 0) {
      values[existingIndex] = metric;
    } else {
      values.push(metric);
    }
    
    this.metrics.set(metric.name, values);
  }

  /**
   * Compara labels de métricas
   */
  private labelsMatch(labels1?: Record<string, string>, labels2?: Record<string, string>): boolean {
    if (!labels1 && !labels2) return true;
    if (!labels1 || !labels2) return false;
    
    const keys1 = Object.keys(labels1).sort();
    const keys2 = Object.keys(labels2).sort();
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => labels1[key] === labels2[key]);
  }

  /**
   * Exporta métricas no formato Prometheus
   */
  public exportMetrics(): string {
    let output = '';
    
    for (const [metricName, config] of this.metricConfigs) {
      const values = this.metrics.get(metricName) || [];
      
      if (values.length === 0) continue;
      
      // Header da métrica
      output += `# HELP ${metricName} ${config.help}\n`;
      output += `# TYPE ${metricName} ${config.type}\n`;
      
      // Valores
      for (const value of values) {
        let line = metricName;
        
        if (value.labels && Object.keys(value.labels).length > 0) {
          const labelPairs = Object.entries(value.labels)
            .map(([key, val]) => `${key}="${val}"`)
            .join(',');
          line += `{${labelPairs}}`;
        }
        
        line += ` ${value.value}`;
        
        if (value.timestamp) {
          line += ` ${value.timestamp}`;
        }
        
        output += line + '\n';
      }
      
      output += '\n';
    }
    
    return output;
  }

  /**
   * Endpoint para exposição de métricas
   */
  public metricsEndpoint() {
    return (req: Request, res: Response) => {
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(this.exportMetrics());
    };
  }

  /**
   * Obtém estatísticas resumidas
   */
  public getStats(): {
    totalMetrics: number;
    totalRequests: number;
    totalErrors: number;
    activeConnections: number;
    uptime: number;
    errorRate: number;
  } {
    const totalMetrics = Array.from(this.metrics.values())
      .reduce((sum, values) => sum + values.length, 0);
    
    return {
      totalMetrics,
      totalRequests: this.systemStats.totalRequests,
      totalErrors: this.systemStats.totalErrors,
      activeConnections: this.systemStats.activeConnections,
      uptime: Math.floor((Date.now() - this.systemStats.startTime) / 1000),
      errorRate: this.systemStats.totalRequests > 0 
        ? (this.systemStats.totalErrors / this.systemStats.totalRequests) * 100 
        : 0
    };
  }

  /**
   * Registra evento de negócio
   */
  public recordBusinessEvent(eventType: string, status: 'success' | 'failure' = 'success'): void {
    this.incrementCounter('business_events_total', 1, {
      event_type: eventType,
      status
    });
  }

  /**
   * Registra operação de cache
   */
  public recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete'): void {
    this.incrementCounter('cache_operations_total', 1, {
      operation,
      result: operation === 'hit' ? 'success' : 'miss'
    });
  }

  /**
   * Registra query de database
   */
  public recordDatabaseQuery(duration: number, type: 'select' | 'insert' | 'update' | 'delete'): void {
    this.observeHistogram('database_query_duration_ms', duration, { query_type: type });
  }
}

// Instância singleton
export const prometheusService = new PrometheusService();