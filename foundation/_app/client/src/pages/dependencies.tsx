import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { 
  Package, 
  Database, 
  Server, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  BarChart3,
  Monitor,
  Globe,
  Code,
  Settings
} from "lucide-react";
import { useState } from "react";

interface Dependency {
  name: string;
  version: string;
  type: "frontend" | "backend" | "database" | "system" | "security";
  status: "active" | "inactive" | "error" | "outdated";
  capacitiesSupported: string[];
  memoryUsage?: number;
  lastUsed?: string;
  description: string;
  location: string;
  installationDate: string;
  updateAvailable?: boolean;
  criticalIssues?: number;
  warnings?: number;
}

// Dados simulados das dependências reais do projeto
const dependencies: Dependency[] = [
  {
    name: "React",
    version: "18.2.0",
    type: "frontend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 45,
    lastUsed: "2025-07-04T02:18:00Z",
    description: "Biblioteca principal para interface de usuário",
    location: "client/node_modules",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 1
  },
  {
    name: "Express.js",
    version: "4.18.2",
    type: "backend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 32,
    lastUsed: "2025-07-04T02:18:00Z",
    description: "Framework de servidor web para Node.js",
    location: "server/node_modules",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "PostgreSQL Driver",
    version: "3.4.4",
    type: "database",
    status: "active",
    capacitiesSupported: ["small", "medium", "large", "enterprise"],
    memoryUsage: 28,
    lastUsed: "2025-07-04T02:18:00Z",
    description: "Driver para conexão com PostgreSQL via Neon",
    location: "server/node_modules/@neondatabase",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Drizzle ORM",
    version: "0.29.3",
    type: "database",
    status: "active",
    capacitiesSupported: ["micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 15,
    lastUsed: "2025-07-04T02:18:00Z",
    description: "ORM TypeScript-first para banco de dados",
    location: "shared/schema.ts",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "bcrypt",
    version: "5.1.1",
    type: "security",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 8,
    lastUsed: "2025-07-04T02:17:00Z",
    description: "Biblioteca para hash seguro de senhas",
    location: "server/node_modules",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "TailwindCSS",
    version: "3.4.1",
    type: "frontend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 12,
    lastUsed: "2025-07-04T02:18:00Z",
    description: "Framework CSS utilitário",
    location: "client/src/index.css",
    installationDate: "2025-06-29",
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Redis (Enterprise Only)",
    version: "7.2.0",
    type: "database",
    status: "inactive",
    capacitiesSupported: ["enterprise"],
    memoryUsage: 0,
    description: "Cache em memória para alta performance",
    location: "foundation/configs/enterprise",
    installationDate: "N/A",
    criticalIssues: 0,
    warnings: 1
  },
  {
    name: "Elasticsearch (Enterprise Only)",
    version: "8.11.0",
    type: "system",
    status: "inactive",
    capacitiesSupported: ["enterprise"],
    memoryUsage: 0,
    description: "Sistema de busca e análise de logs",
    location: "foundation/configs/enterprise",
    installationDate: "N/A",
    criticalIssues: 0,
    warnings: 1
  }
];

export default function DependenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: systemConfig } = useQuery({
    queryKey: ['/api/foundation/config'],
  });

  const currentCapacity = (systemConfig as any)?.systemConfig?.foundationCapacity || "large";

  // Filtrar dependências
  const filteredDependencies = dependencies.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dep.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || dep.type === filterType;
    const matchesStatus = filterStatus === "all" || dep.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: dependencies.length,
    active: dependencies.filter(d => d.status === "active").length,
    inactive: dependencies.filter(d => d.status === "inactive").length,
    criticalIssues: dependencies.reduce((sum, d) => sum + (d.criticalIssues || 0), 0),
    warnings: dependencies.reduce((sum, d) => sum + (d.warnings || 0), 0),
    memoryUsage: dependencies.reduce((sum, d) => sum + (d.memoryUsage || 0), 0),
  };

  const alerts = [];
  if (stats.criticalIssues > 0) {
    alerts.push({
      type: "error" as const,
      message: `${stats.criticalIssues} dependências com problemas críticos`,
      count: stats.criticalIssues
    });
  }
  if (stats.warnings > 0) {
    alerts.push({
      type: "warning" as const,
      message: `${stats.warnings} dependências com avisos`,
      count: stats.warnings
    });
  }
  if (stats.inactive > 0) {
    alerts.push({
      type: "info" as const,
      message: `${stats.inactive} dependências inativas (outras capacidades)`,
      count: stats.inactive
    });
  }

  const totals = {
    activeUsers: 1,
    totalCapacities: 6,
    activeAlerts: alerts.length,
    systemHealth: stats.criticalIssues > 0 ? "critical" as const : 
                  stats.warnings > 0 ? "degraded" as const : "healthy" as const
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive": return <XCircle className="h-4 w-4 text-gray-400" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "outdated": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "frontend": return <Code className="h-4 w-4 text-blue-500" />;
      case "backend": return <Server className="h-4 w-4 text-green-500" />;
      case "database": return <Database className="h-4 w-4 text-purple-500" />;
      case "system": return <Monitor className="h-4 w-4 text-orange-500" />;
      case "security": return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <MainLayout 
      title="Dependências & Bibliotecas" 
      totals={totals}
      alerts={alerts}
    >
      <div className="space-y-6">
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Dependências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} ativas, {stats.inactive} inativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memoryUsage}MB</div>
              <Progress value={(stats.memoryUsage / 200) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Problemas Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.criticalIssues}</div>
              <p className="text-xs text-muted-foreground">Requer ação imediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.warnings}</div>
              <p className="text-xs text-muted-foreground">Monitoramento necessário</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar dependências..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os tipos</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="system">Sistema</option>
                <option value="security">Segurança</option>
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
                <option value="error">Com erro</option>
                <option value="outdated">Desatualizadas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Dependências */}
        <Card>
          <CardHeader>
            <CardTitle>Dependências Detalhadas</CardTitle>
            <CardDescription>
              Capacidade atual: <Badge variant="outline">{currentCapacity.toUpperCase()}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDependencies.map((dep, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(dep.type)}
                      <div>
                        <h3 className="font-semibold">{dep.name}</h3>
                        <p className="text-sm text-muted-foreground">v{dep.version}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(dep.status)}
                      <Badge variant={dep.status === "active" ? "default" : "secondary"}>
                        {dep.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm">{dep.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Localização:</span>
                      <p className="text-muted-foreground">{dep.location}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Instalação:</span>
                      <p className="text-muted-foreground">{dep.installationDate}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Memória:</span>
                      <p className="text-muted-foreground">{dep.memoryUsage || 0}MB</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Último uso:</span>
                      <p className="text-muted-foreground">
                        {dep.lastUsed ? new Date(dep.lastUsed).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Capacidades suportadas */}
                  <div>
                    <span className="font-medium text-sm">Capacidades suportadas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["nano", "micro", "small", "medium", "large", "enterprise"].map(capacity => {
                        const isSupported = dep.capacitiesSupported.includes(capacity);
                        const isCurrent = capacity === currentCapacity;
                        return (
                          <Badge 
                            key={capacity} 
                            variant={isSupported ? (isCurrent ? "default" : "secondary") : "outline"}
                            className={!isSupported ? "opacity-50" : ""}
                          >
                            {capacity.toUpperCase()}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Problemas e avisos */}
                  {((dep.criticalIssues && dep.criticalIssues > 0) || (dep.warnings && dep.warnings > 0)) && (
                    <div className="flex gap-4 pt-2 border-t">
                      {dep.criticalIssues && dep.criticalIssues > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {dep.criticalIssues} críticos
                        </Badge>
                      )}
                      {dep.warnings && dep.warnings > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {dep.warnings} avisos
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}