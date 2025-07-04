import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Activity, Cpu, Database, Users, Zap, TrendingUp } from "lucide-react";

interface FoundationMetrics {
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

interface HealthStatus {
  status: string;
  details: {
    uptime: number;
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    response_time: number;
    error_rate: number;
  };
}

export function FoundationMetrics() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<FoundationMetrics>({
    queryKey: ["/api/monitoring/metrics"],
    refetchInterval: 10000, // Refresh every 10 seconds as per LARGE config
  });

  const { data: health, isLoading: healthLoading } = useQuery<HealthStatus>({
    queryKey: ["/api/monitoring/health"],
    refetchInterval: 10000, // Match LARGE capacity monitoring frequency
  });

  const { data: foundationConfig } = useQuery({
    queryKey: ["/api/foundation/config"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Destructure foundation config data for easier access
  const systemConfig = (foundationConfig as any)?.systemConfig;
  const foundationSpec = (foundationConfig as any)?.foundationConfig;
  const currentCapacity = (foundationConfig as any)?.currentCapacity;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "degraded": return "bg-yellow-500";
      case "unhealthy": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy": return "Saudável";
      case "degraded": return "Degradado";
      case "unhealthy": return "Crítico";
      default: return "Desconhecido";
    }
  };

  if (metricsLoading || healthLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            duEuler Foundation v3.0
          </CardTitle>
          <CardDescription>Carregando métricas do sistema...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          duEuler Foundation v3.0
        </CardTitle>
        <CardDescription>
          {(foundationConfig as any)?.foundationConfig ? 
            `${(foundationConfig as any).foundationConfig.description} (${(foundationConfig as any).foundationConfig.userRange.min.toLocaleString()}-${(foundationConfig as any).foundationConfig.userRange.max.toLocaleString()} usuários)` :
            "Sistema otimizado para 500.000 usuários simultâneos (Capacidade LARGE)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Foundation Capacity Info */}
        {foundationSpec && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Capacidade Foundation</h4>
              <Badge className="bg-blue-600 text-white">{currentCapacity?.toUpperCase()}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Usuários Simultâneos</div>
                <div className="font-semibold">{systemConfig?.maxConcurrentUsers?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  Suporte: {foundationSpec.userRange.min.toLocaleString()}-{foundationSpec.userRange.max.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">Recursos Alocados</div>
                <div className="font-semibold">
                  {(foundationSpec.resources.ramMB / 1024).toFixed(0)}GB RAM, {foundationSpec.resources.cpuCores} cores
                </div>
                <div className="text-xs text-gray-500">
                  Storage: {foundationSpec.resources.storageGB}GB
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">Performance Target</div>
                <div className="font-semibold">{foundationSpec.performance.responseTimeTargetMs}ms</div>
                <div className="text-xs text-gray-500">
                  {foundationSpec.performance.throughputRps.toLocaleString()} RPS
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400">Disponibilidade</div>
                <div className="font-semibold">{foundationSpec.performance.availabilityTarget}%</div>
                <div className="text-xs text-gray-500">
                  Monitoramento: {foundationSpec.monitoring.scrapeInterval}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.status || 'unknown')}`}></div>
            <span className="font-medium">Status do Sistema</span>
          </div>
          <Badge variant={health?.status === 'healthy' ? 'default' : 'destructive'}>
            {getStatusText(health?.status || 'unknown')}
          </Badge>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tempo Ativo</span>
          </div>
          <span className="text-sm font-medium">
            {health?.details ? formatUptime(health.details.uptime) : 'N/A'}
          </span>
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Uso de CPU</span>
            </div>
            <span className="text-sm font-medium">
              {metrics?.cpu_usage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={metrics?.cpu_usage || 0} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            Limite recomendado: 80% (Configuração SMALL)
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Uso de Memória</span>
            </div>
            <span className="text-sm font-medium">
              {metrics?.memory_usage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={metrics?.memory_usage || 0} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            Capacidade: 2GB RAM (Configuração SMALL)
          </div>
        </div>

        {/* Active Users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Usuários Ativos</span>
            </div>
            <span className="text-sm font-medium">
              {metrics?.user_sessions || 0} / 10.000
            </span>
          </div>
          <Progress 
            value={((metrics?.user_sessions || 0) / 10000) * 100} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            Capacidade máxima suportada pela Foundation
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tempo de Resposta</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">
              {metrics?.response_time_avg.toFixed(0)}ms
            </span>
            <div className="text-xs text-muted-foreground">
              Meta: &lt;100ms
            </div>
          </div>
        </div>

        {/* Connection Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {metrics?.active_connections || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Conexões Ativas
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {health?.details ? health.details.error_rate.toFixed(2) : '0.00'}%
            </div>
            <div className="text-xs text-muted-foreground">
              Taxa de Erro
            </div>
          </div>
        </div>

        {/* Foundation Info */}
        <div className="pt-4 border-t text-center">
          <div className="text-xs text-muted-foreground">
            duEuler Foundation v3.0 | Configuração {(foundationConfig as any)?.currentCapacity?.toUpperCase() || 'SMALL'}
          </div>
          <div className="text-xs text-muted-foreground">
            {(foundationConfig as any)?.foundationConfig ? 
              `RAM: ${(foundationConfig as any).foundationConfig.resources.ramMB}MB | CPU: ${(foundationConfig as any).foundationConfig.resources.cpuCores} cores` :
              "Otimizado para 10K-50K usuários simultâneos"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}