/**
 * Monitoring Integration - Integração Prometheus + Grafana
 * Orquestra os serviços de monitoramento e métricas
 * 
 * Funcionalidades:
 * - Configuração automática de datasources
 * - Deploy de dashboards
 * - Configuração de alertas
 * - Health checks do sistema de monitoramento
 */

import { Express, Request, Response } from 'express';
import { prometheusService } from './PrometheusService';
import { grafanaService } from './GrafanaService';

export interface MonitoringConfig {
  prometheus: {
    enabled: boolean;
    port: number;
    metricsPath: string;
    scrapeInterval: string;
  };
  grafana: {
    enabled: boolean;
    port: number;
    adminUser: string;
    adminPassword: string;
    datasourceUrl: string;
  };
  alerts: {
    enabled: boolean;
    emailNotifications: boolean;
    slackWebhook?: string;
  };
}

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  responseTime: number;
  details?: any;
}

export class MonitoringIntegration {
  private config: MonitoringConfig;
  private healthStatuses: Map<string, HealthStatus> = new Map();

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.initializeMonitoring();
  }

  /**
   * Inicializa sistema de monitoramento
   */
  private async initializeMonitoring(): Promise<void> {
    try {
      console.log('🔧 Inicializando sistema de monitoramento...');

      if (this.config.prometheus.enabled) {
        console.log('📊 Configurando Prometheus...');
        this.setupPrometheusConfig();
      }

      if (this.config.grafana.enabled) {
        console.log('📈 Configurando Grafana...');
        await this.setupGrafanaConfig();
      }

      if (this.config.alerts.enabled) {
        console.log('🚨 Configurando alertas...');
        this.setupAlerts();
      }

      // Inicia health checks
      this.startHealthChecks();

      console.log('✅ Sistema de monitoramento inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro na inicialização do monitoramento:', error);
      throw error;
    }
  }

  /**
   * Configura Prometheus
   */
  private setupPrometheusConfig(): void {
    // Registra métricas customizadas de negócio
    prometheusService.registerMetric({
      name: 'replit_optimization_events',
      help: 'Eventos de otimização do Replit',
      type: 'counter',
      labels: ['optimization_type', 'status']
    });

    prometheusService.registerMetric({
      name: 'replit_cost_savings',
      help: 'Economia de custos em dólares',
      type: 'gauge',
      labels: ['category']
    });

    prometheusService.registerMetric({
      name: 'replit_resource_efficiency',
      help: 'Eficiência de recursos em percentual',
      type: 'gauge',
      labels: ['resource_type']
    });

    console.log('✅ Prometheus configurado com métricas customizadas');
  }

  /**
   * Configura Grafana (simulado - em produção faria chamadas API)
   */
  private async setupGrafanaConfig(): Promise<void> {
    try {
      // Em ambiente real, faria calls para API do Grafana
      // Por enquanto, configuramos localmente

      // Setup datasource
      console.log('🔗 Configurando datasource Prometheus...');
      
      // Setup alertas padrão
      grafanaService.setupDefaultAlerts();
      
      // Cria dashboard customizado para Replit Optimization
      this.createReplitOptimizationDashboard();

      console.log('✅ Grafana configurado com dashboards e alertas');
    } catch (error) {
      console.error('❌ Erro na configuração do Grafana:', error);
      throw error;
    }
  }

  /**
   * Cria dashboard específico para otimização do Replit
   */
  private createReplitOptimizationDashboard(): void {
    grafanaService.createCustomDashboard({
      id: 'replit-optimization',
      title: 'Replit Optimization Dashboard',
      tags: ['replit', 'optimization', 'cost-savings'],
      panels: [
        {
          id: 1,
          title: 'Cost Savings (USD)',
          type: 'stat',
          gridPos: { x: 0, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'sum(replit_cost_savings)',
              refId: 'A',
              legendFormat: 'Total Savings'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'currencyUSD'
            }
          }
        },
        {
          id: 2,
          title: 'Resource Efficiency',
          type: 'gauge',
          gridPos: { x: 6, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'avg(replit_resource_efficiency)',
              refId: 'A',
              legendFormat: 'Efficiency %'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              min: 0,
              max: 100
            }
          }
        },
        {
          id: 3,
          title: 'Optimization Events Rate',
          type: 'graph',
          gridPos: { x: 0, y: 4, w: 12, h: 8 },
          targets: [
            {
              expr: 'rate(replit_optimization_events[5m])',
              refId: 'A',
              legendFormat: '{{optimization_type}} - {{status}}'
            }
          ]
        }
      ]
    });
  }

  /**
   * Configura alertas do sistema
   */
  private setupAlerts(): void {
    // Alertas específicos para Replit optimization
    grafanaService.createAlert({
      name: 'Low Resource Efficiency',
      query: 'avg(replit_resource_efficiency) < 70',
      condition: 'lt',
      threshold: 70,
      frequency: '5m',
      notifications: ['email']
    });

    grafanaService.createAlert({
      name: 'High Optimization Failures',
      query: 'rate(replit_optimization_events{status="failure"}[10m]) > 5',
      condition: 'gt',
      threshold: 5,
      frequency: '2m',
      notifications: ['email', 'slack']
    });

    console.log('✅ Alertas configurados');
  }

  /**
   * Inicia health checks periódicos
   */
  private startHealthChecks(): void {
    // Health check inicial
    this.performHealthChecks();

    // Health checks a cada 30 segundos
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  /**
   * Executa health checks de todos os serviços
   */
  private async performHealthChecks(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check Prometheus Service
      const prometheusHealth = await this.checkPrometheusHealth();
      this.healthStatuses.set('prometheus', {
        service: 'prometheus',
        status: prometheusHealth.healthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        details: prometheusHealth
      });

      // Check Grafana Service
      const grafanaHealth = await this.checkGrafanaHealth();
      this.healthStatuses.set('grafana', {
        service: 'grafana',
        status: grafanaHealth.healthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        details: grafanaHealth
      });

      // Check overall system health
      const systemHealth = await this.checkSystemHealth();
      this.healthStatuses.set('system', {
        service: 'system',
        status: systemHealth.healthy ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        details: systemHealth
      });

    } catch (error) {
      console.error('❌ Erro no health check:', error);
    }
  }

  /**
   * Verifica saúde do Prometheus
   */
  private async checkPrometheusHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = prometheusService.getStats();
      
      return {
        healthy: stats.totalMetrics > 0,
        details: {
          totalMetrics: stats.totalMetrics,
          totalRequests: stats.totalRequests,
          errorRate: stats.errorRate,
          uptime: stats.uptime
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  /**
   * Verifica saúde do Grafana
   */
  private async checkGrafanaHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = grafanaService.getStats();
      
      return {
        healthy: stats.totalDashboards > 0,
        details: {
          totalDashboards: stats.totalDashboards,
          totalPanels: stats.totalPanels,
          totalAlerts: stats.totalAlerts,
          datasources: stats.datasources
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  /**
   * Verifica saúde geral do sistema
   */
  private async checkSystemHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Considera sistema saudável se:
      // - Uptime > 60s
      // - Uso de heap < 80% do total
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      const isHealthy = uptime > 60 && heapUsagePercent < 80;

      return {
        healthy: isHealthy,
        details: {
          uptime,
          heapUsagePercent,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          rss: memUsage.rss
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }

  /**
   * Registra rotas de monitoramento no Express
   */
  public registerRoutes(app: Express): void {
    // Endpoint de métricas Prometheus
    app.get('/metrics', prometheusService.metricsEndpoint());

    // Endpoint de health check
    app.get('/health', (req: Request, res: Response) => {
      const allHealthy = Array.from(this.healthStatuses.values())
        .every(status => status.status === 'healthy');

      const response = {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: Object.fromEntries(this.healthStatuses)
      };

      res.status(allHealthy ? 200 : 503).json(response);
    });

    // Endpoint para estatísticas de monitoramento
    app.get('/monitoring/stats', (req: Request, res: Response) => {
      const prometheusStats = prometheusService.getStats();
      const grafanaStats = grafanaService.getStats();

      res.json({
        prometheus: prometheusStats,
        grafana: grafanaStats,
        health: Object.fromEntries(this.healthStatuses),
        config: {
          prometheus: this.config.prometheus,
          grafana: { ...this.config.grafana, adminPassword: '***' },
          alerts: this.config.alerts
        }
      });
    });

    // Endpoint para dashboards
    app.get('/monitoring/dashboards', (req: Request, res: Response) => {
      const dashboards = grafanaService.listDashboards();
      res.json(dashboards);
    });

    // Endpoint para exportar dashboard específico
    app.get('/monitoring/dashboards/:id/export', (req: Request, res: Response) => {
      const { id } = req.params;
      const exported = grafanaService.exportDashboard(id);
      
      if (!exported) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${id}-dashboard.json`);
      res.send(exported);
    });

    console.log('✅ Rotas de monitoramento registradas');
  }

  /**
   * Middleware para métricas automáticas
   */
  public getMiddleware() {
    return prometheusService.expressMiddleware();
  }

  /**
   * Registra evento de otimização
   */
  public recordOptimizationEvent(type: string, status: 'success' | 'failure'): void {
    prometheusService.incrementCounter('replit_optimization_events', 1, {
      optimization_type: type,
      status
    });
  }

  /**
   * Registra economia de custos
   */
  public recordCostSavings(amount: number, category: string): void {
    prometheusService.setGauge('replit_cost_savings', amount, { category });
  }

  /**
   * Registra eficiência de recursos
   */
  public recordResourceEfficiency(percentage: number, resourceType: string): void {
    prometheusService.setGauge('replit_resource_efficiency', percentage, {
      resource_type: resourceType
    });
  }

  /**
   * Obtém configuração atual
   */
  public getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuração de monitoramento atualizada');
  }
}

// Configuração padrão
const defaultConfig: MonitoringConfig = {
  prometheus: {
    enabled: true,
    port: 9090,
    metricsPath: '/metrics',
    scrapeInterval: '15s'
  },
  grafana: {
    enabled: true,
    port: 3001,
    adminUser: 'admin',
    adminPassword: 'admin123',
    datasourceUrl: 'http://localhost:9090'
  },
  alerts: {
    enabled: true,
    emailNotifications: true,
    slackWebhook: process.env.SLACK_WEBHOOK_URL
  }
};

// Instância singleton
export const monitoringIntegration = new MonitoringIntegration(defaultConfig);