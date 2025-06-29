/**
 * Grafana Service - Sistema de Dashboards e Visualização
 * Implementa dashboards programáticos e integração com Prometheus
 * 
 * Funcionalidades:
 * - Criação automática de dashboards
 * - Templates de painéis reutilizáveis
 * - Alertas configuráveis
 * - Datasource management
 */

export interface GrafanaDashboard {
  id?: number;
  uid?: string;
  title: string;
  tags: string[];
  timezone: string;
  panels: GrafanaPanel[];
  templating: {
    list: GrafanaTemplate[];
  };
  time: {
    from: string;
    to: string;
  };
  refresh: string;
}

export interface GrafanaPanel {
  id: number;
  title: string;
  type: 'graph' | 'stat' | 'table' | 'heatmap' | 'logs' | 'gauge';
  gridPos: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  targets: GrafanaTarget[];
  fieldConfig?: {
    defaults: {
      unit?: string;
      min?: number;
      max?: number;
      color?: {
        mode: string;
      };
    };
  };
  options?: any;
}

export interface GrafanaTarget {
  expr: string;
  refId: string;
  legendFormat: string;
  interval?: string;
}

export interface GrafanaTemplate {
  name: string;
  type: 'query' | 'interval' | 'datasource' | 'constant';
  query?: string;
  options?: Array<{ text: string; value: string }>;
  current?: { text: string; value: string };
}

export interface AlertRule {
  name: string;
  query: string;
  condition: string;
  threshold: number;
  frequency: string;
  notifications: string[];
}

export class GrafanaService {
  private dashboards: Map<string, GrafanaDashboard> = new Map();
  private datasources: Map<string, any> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();

  constructor() {
    this.initializeDefaultDatasources();
    this.createDefaultDashboards();
  }

  /**
   * Inicializa datasources padrão
   */
  private initializeDefaultDatasources(): void {
    const prometheusDatasource = {
      name: 'Prometheus',
      type: 'prometheus',
      url: 'http://localhost:9090',
      access: 'proxy',
      isDefault: true
    };

    this.datasources.set('prometheus', prometheusDatasource);
  }

  /**
   * Cria dashboards padrão do sistema
   */
  private createDefaultDashboards(): void {
    // Dashboard de System Overview
    const systemOverview = this.createSystemOverviewDashboard();
    this.dashboards.set('system-overview', systemOverview);

    // Dashboard de Application Performance
    const appPerformance = this.createApplicationPerformanceDashboard();
    this.dashboards.set('app-performance', appPerformance);

    // Dashboard de Business Metrics
    const businessMetrics = this.createBusinessMetricsDashboard();
    this.dashboards.set('business-metrics', businessMetrics);

    // Dashboard de Infrastructure
    const infrastructure = this.createInfrastructureDashboard();
    this.dashboards.set('infrastructure', infrastructure);
  }

  /**
   * Cria dashboard de System Overview
   */
  private createSystemOverviewDashboard(): GrafanaDashboard {
    return {
      title: 'System Overview',
      tags: ['system', 'overview'],
      timezone: 'browser',
      time: {
        from: 'now-1h',
        to: 'now'
      },
      refresh: '30s',
      templating: {
        list: [
          {
            name: 'instance',
            type: 'query',
            query: 'label_values(up, instance)',
            current: { text: 'All', value: '$__all' }
          }
        ]
      },
      panels: [
        // CPU Usage
        {
          id: 1,
          title: 'CPU Usage',
          type: 'stat',
          gridPos: { x: 0, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'system_cpu_usage_percent',
              refId: 'A',
              legendFormat: 'CPU %'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              min: 0,
              max: 100,
              color: { mode: 'thresholds' }
            }
          }
        },
        // Memory Usage
        {
          id: 2,
          title: 'Memory Usage',
          type: 'stat',
          gridPos: { x: 6, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'system_memory_usage_bytes / system_memory_total_bytes * 100',
              refId: 'A',
              legendFormat: 'Memory %'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              min: 0,
              max: 100,
              color: { mode: 'thresholds' }
            }
          }
        },
        // Active Connections
        {
          id: 3,
          title: 'Active Connections',
          type: 'stat',
          gridPos: { x: 12, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'user_sessions_active',
              refId: 'A',
              legendFormat: 'Connections'
            }
          ]
        },
        // Uptime
        {
          id: 4,
          title: 'Uptime',
          type: 'stat',
          gridPos: { x: 18, y: 0, w: 6, h: 4 },
          targets: [
            {
              expr: 'nodejs_process_uptime_seconds',
              refId: 'A',
              legendFormat: 'Uptime'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'seconds'
            }
          }
        },
        // Request Rate
        {
          id: 5,
          title: 'Request Rate',
          type: 'graph',
          gridPos: { x: 0, y: 4, w: 12, h: 8 },
          targets: [
            {
              expr: 'rate(http_requests_total[5m])',
              refId: 'A',
              legendFormat: 'Requests/sec'
            }
          ]
        },
        // Error Rate
        {
          id: 6,
          title: 'Error Rate',
          type: 'graph',
          gridPos: { x: 12, y: 4, w: 12, h: 8 },
          targets: [
            {
              expr: 'rate(application_errors_total[5m])',
              refId: 'A',
              legendFormat: 'Errors/sec'
            }
          ]
        }
      ]
    };
  }

  /**
   * Cria dashboard de Application Performance
   */
  private createApplicationPerformanceDashboard(): GrafanaDashboard {
    return {
      title: 'Application Performance',
      tags: ['application', 'performance'],
      timezone: 'browser',
      time: {
        from: 'now-4h',
        to: 'now'
      },
      refresh: '1m',
      templating: {
        list: [
          {
            name: 'endpoint',
            type: 'query',
            query: 'label_values(http_requests_total, endpoint)',
            current: { text: 'All', value: '$__all' }
          }
        ]
      },
      panels: [
        // Response Time
        {
          id: 1,
          title: 'Response Time by Endpoint',
          type: 'graph',
          gridPos: { x: 0, y: 0, w: 12, h: 8 },
          targets: [
            {
              expr: 'histogram_quantile(0.95, rate(http_request_duration_ms_bucket{endpoint=~"$endpoint"}[5m]))',
              refId: 'A',
              legendFormat: '95th percentile - {{endpoint}}'
            },
            {
              expr: 'histogram_quantile(0.50, rate(http_request_duration_ms_bucket{endpoint=~"$endpoint"}[5m]))',
              refId: 'B',
              legendFormat: '50th percentile - {{endpoint}}'
            }
          ]
        },
        // Throughput
        {
          id: 2,
          title: 'Throughput by Status Code',
          type: 'graph',
          gridPos: { x: 12, y: 0, w: 12, h: 8 },
          targets: [
            {
              expr: 'sum(rate(http_requests_total[5m])) by (status)',
              refId: 'A',
              legendFormat: 'Status {{status}}'
            }
          ]
        },
        // Database Performance
        {
          id: 3,
          title: 'Database Query Duration',
          type: 'graph',
          gridPos: { x: 0, y: 8, w: 12, h: 8 },
          targets: [
            {
              expr: 'histogram_quantile(0.95, rate(database_query_duration_ms_bucket[5m]))',
              refId: 'A',
              legendFormat: '95th percentile'
            }
          ]
        },
        // Cache Performance
        {
          id: 4,
          title: 'Cache Hit Rate',
          type: 'stat',
          gridPos: { x: 12, y: 8, w: 12, h: 8 },
          targets: [
            {
              expr: 'rate(cache_operations_total{result="success"}[5m]) / rate(cache_operations_total[5m]) * 100',
              refId: 'A',
              legendFormat: 'Hit Rate %'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              min: 0,
              max: 100
            }
          }
        }
      ]
    };
  }

  /**
   * Cria dashboard de Business Metrics
   */
  private createBusinessMetricsDashboard(): GrafanaDashboard {
    return {
      title: 'Business Metrics',
      tags: ['business', 'kpi'],
      timezone: 'browser',
      time: {
        from: 'now-24h',
        to: 'now'
      },
      refresh: '5m',
      templating: {
        list: [
          {
            name: 'event_type',
            type: 'query',
            query: 'label_values(business_events_total, event_type)',
            current: { text: 'All', value: '$__all' }
          }
        ]
      },
      panels: [
        // Business Events
        {
          id: 1,
          title: 'Business Events Rate',
          type: 'graph',
          gridPos: { x: 0, y: 0, w: 24, h: 8 },
          targets: [
            {
              expr: 'rate(business_events_total{event_type=~"$event_type"}[1h])',
              refId: 'A',
              legendFormat: '{{event_type}} - {{status}}'
            }
          ]
        },
        // Success Rate
        {
          id: 2,
          title: 'Success Rate by Event Type',
          type: 'stat',
          gridPos: { x: 0, y: 8, w: 12, h: 6 },
          targets: [
            {
              expr: 'rate(business_events_total{status="success"}[1h]) / rate(business_events_total[1h]) * 100',
              refId: 'A',
              legendFormat: 'Success Rate %'
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
        // Total Events Today
        {
          id: 3,
          title: 'Total Events (24h)',
          type: 'stat',
          gridPos: { x: 12, y: 8, w: 12, h: 6 },
          targets: [
            {
              expr: 'increase(business_events_total[24h])',
              refId: 'A',
              legendFormat: 'Total Events'
            }
          ]
        }
      ]
    };
  }

  /**
   * Cria dashboard de Infrastructure
   */
  private createInfrastructureDashboard(): GrafanaDashboard {
    return {
      title: 'Infrastructure Monitoring',
      tags: ['infrastructure', 'system'],
      timezone: 'browser',
      time: {
        from: 'now-2h',
        to: 'now'
      },
      refresh: '30s',
      templating: {
        list: []
      },
      panels: [
        // Node.js Heap Usage
        {
          id: 1,
          title: 'Node.js Heap Usage',
          type: 'graph',
          gridPos: { x: 0, y: 0, w: 12, h: 8 },
          targets: [
            {
              expr: 'nodejs_heap_used_bytes',
              refId: 'A',
              legendFormat: 'Heap Used'
            },
            {
              expr: 'nodejs_heap_total_bytes',
              refId: 'B',
              legendFormat: 'Heap Total'
            }
          ],
          fieldConfig: {
            defaults: {
              unit: 'bytes'
            }
          }
        },
        // System Resources
        {
          id: 2,
          title: 'System Resources Over Time',
          type: 'graph',
          gridPos: { x: 12, y: 0, w: 12, h: 8 },
          targets: [
            {
              expr: 'system_cpu_usage_percent',
              refId: 'A',
              legendFormat: 'CPU %'
            },
            {
              expr: 'system_memory_usage_bytes / system_memory_total_bytes * 100',
              refId: 'B',
              legendFormat: 'Memory %'
            }
          ]
        }
      ]
    };
  }

  /**
   * Cria um alerta personalizado
   */
  public createAlert(rule: AlertRule): void {
    this.alertRules.set(rule.name, rule);
  }

  /**
   * Obtém dashboard por ID
   */
  public getDashboard(id: string): GrafanaDashboard | undefined {
    return this.dashboards.get(id);
  }

  /**
   * Lista todos os dashboards
   */
  public listDashboards(): Array<{ id: string; title: string; tags: string[] }> {
    return Array.from(this.dashboards.entries()).map(([id, dashboard]) => ({
      id,
      title: dashboard.title,
      tags: dashboard.tags
    }));
  }

  /**
   * Exporta dashboard para JSON do Grafana
   */
  public exportDashboard(id: string): string | null {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return null;

    const grafanaFormat = {
      dashboard: {
        ...dashboard,
        id: null, // Remove ID para import
        version: 1,
        schemaVersion: 16
      },
      folderId: 0,
      overwrite: true
    };

    return JSON.stringify(grafanaFormat, null, 2);
  }

  /**
   * Cria dashboard customizado
   */
  public createCustomDashboard(config: {
    id: string;
    title: string;
    tags: string[];
    panels: GrafanaPanel[];
  }): void {
    const dashboard: GrafanaDashboard = {
      title: config.title,
      tags: config.tags,
      timezone: 'browser',
      time: {
        from: 'now-1h',
        to: 'now'
      },
      refresh: '30s',
      templating: { list: [] },
      panels: config.panels
    };

    this.dashboards.set(config.id, dashboard);
  }

  /**
   * Gera configuração do alerta em formato Grafana
   */
  public exportAlerts(): string {
    const alerts = Array.from(this.alertRules.values()).map(rule => ({
      alert: {
        name: rule.name,
        frequency: rule.frequency,
        conditions: [
          {
            query: {
              queryType: '',
              refId: 'A',
              model: {
                expr: rule.query,
                refId: 'A'
              }
            },
            reducer: {
              type: 'last',
              params: []
            },
            evaluator: {
              params: [rule.threshold],
              type: rule.condition
            }
          }
        ],
        notifications: rule.notifications
      }
    }));

    return JSON.stringify({ alerts }, null, 2);
  }

  /**
   * Obtém estatísticas do serviço
   */
  public getStats(): {
    totalDashboards: number;
    totalPanels: number;
    totalAlerts: number;
    datasources: number;
  } {
    const totalPanels = Array.from(this.dashboards.values())
      .reduce((sum, dashboard) => sum + dashboard.panels.length, 0);

    return {
      totalDashboards: this.dashboards.size,
      totalPanels,
      totalAlerts: this.alertRules.size,
      datasources: this.datasources.size
    };
  }

  /**
   * Configura alertas padrão do sistema
   */
  public setupDefaultAlerts(): void {
    const defaultAlerts: AlertRule[] = [
      {
        name: 'High CPU Usage',
        query: 'system_cpu_usage_percent > 80',
        condition: 'gt',
        threshold: 80,
        frequency: '1m',
        notifications: ['email', 'slack']
      },
      {
        name: 'High Memory Usage',
        query: 'system_memory_usage_bytes / system_memory_total_bytes * 100 > 90',
        condition: 'gt',
        threshold: 90,
        frequency: '1m',
        notifications: ['email', 'slack']
      },
      {
        name: 'High Error Rate',
        query: 'rate(application_errors_total[5m]) > 10',
        condition: 'gt',
        threshold: 10,
        frequency: '1m',
        notifications: ['email', 'slack']
      },
      {
        name: 'Slow Response Time',
        query: 'histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m])) > 1000',
        condition: 'gt',
        threshold: 1000,
        frequency: '2m',
        notifications: ['email']
      }
    ];

    defaultAlerts.forEach(alert => this.createAlert(alert));
  }
}

// Instância singleton
export const grafanaService = new GrafanaService();