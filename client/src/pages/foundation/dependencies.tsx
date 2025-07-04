import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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

const dependencies: Dependency[] = [
  {
    name: "React",
    version: "18.2.0",
    type: "frontend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 45,
    lastUsed: "2025-01-04",
    description: "Biblioteca JavaScript para criar interfaces de usuário",
    location: "/node_modules/react",
    installationDate: "2024-12-01",
    updateAvailable: false,
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Express.js",
    version: "4.18.2",
    type: "backend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 32,
    lastUsed: "2025-01-04",
    description: "Framework web rápido e flexível para Node.js",
    location: "/node_modules/express",
    installationDate: "2024-12-01",
    updateAvailable: true,
    criticalIssues: 0,
    warnings: 1
  },
  {
    name: "PostgreSQL",
    version: "15.4",
    type: "database",
    status: "active",
    capacitiesSupported: ["micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 128,
    lastUsed: "2025-01-04",
    description: "Sistema de gerenciamento de banco de dados relacional",
    location: "/var/lib/postgresql",
    installationDate: "2024-12-01",
    updateAvailable: false,
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Drizzle ORM",
    version: "0.29.0",
    type: "backend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 18,
    lastUsed: "2025-01-04",
    description: "ORM TypeScript-first para Node.js",
    location: "/node_modules/drizzle-orm",
    installationDate: "2024-12-01",
    updateAvailable: false,
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "TailwindCSS",
    version: "3.4.0",
    type: "frontend",
    status: "active",
    capacitiesSupported: ["nano", "micro", "small", "medium", "large", "enterprise"],
    memoryUsage: 12,
    lastUsed: "2025-01-04",
    description: "Framework CSS utilitário para desenvolvimento rápido",
    location: "/node_modules/tailwindcss",
    installationDate: "2024-12-01",
    updateAvailable: true,
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Prometheus",
    version: "2.45.0",
    type: "system",
    status: "active",
    capacitiesSupported: ["small", "medium", "large", "enterprise"],
    memoryUsage: 256,
    lastUsed: "2025-01-04",
    description: "Sistema de monitoramento e alerta",
    location: "/opt/prometheus",
    installationDate: "2024-12-01",
    updateAvailable: false,
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
    lastUsed: "2025-01-04",
    description: "Biblioteca para hash de senhas",
    location: "/node_modules/bcrypt",
    installationDate: "2024-12-01",
    updateAvailable: false,
    criticalIssues: 0,
    warnings: 0
  },
  {
    name: "Grafana",
    version: "10.2.0",
    type: "system",
    status: "inactive",
    capacitiesSupported: ["medium", "large", "enterprise"],
    memoryUsage: 0,
    lastUsed: "2024-12-15",
    description: "Plataforma de análise e monitoramento",
    location: "/opt/grafana",
    installationDate: "2024-12-01",
    updateAvailable: true,
    criticalIssues: 0,
    warnings: 2
  },
  {
    name: "Elasticsearch",
    version: "8.11.0",
    type: "database",
    status: "error",
    capacitiesSupported: ["large", "enterprise"],
    memoryUsage: 0,
    lastUsed: "2024-12-20",
    description: "Motor de busca e análise distribuído",
    location: "/opt/elasticsearch",
    installationDate: "2024-12-01",
    updateAvailable: false,
    criticalIssues: 2,
    warnings: 0
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
    memoryUsage: dependencies.reduce((sum, d) => sum + (d.memoryUsage || 0), 0)
  };

  // Alertas baseados no status das dependências
  const alerts = [
    ...(stats.criticalIssues > 0 ? [{
      type: "error" as const,
      message: `${stats.criticalIssues} dependência(s) com problemas críticos`,
      count: stats.criticalIssues
    }] : []),
    ...(stats.warnings > 0 ? [{
      type: "warning" as const,
      message: `${stats.warnings} dependência(s) com avisos`,
      count: stats.warnings
    }] : []),
    ...(dependencies.filter(d => d.updateAvailable).length > 0 ? [{
      type: "info" as const,
      message: `${dependencies.filter(d => d.updateAvailable).length} atualização(ões) disponível(eis)`,
      count: dependencies.filter(d => d.updateAvailable).length
    }] : [])
  ];

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
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativas</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Problemas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memória</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.memoryUsage}MB</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar dependências..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="system">Sistema</option>
                  <option value="security">Segurança</option>
                </select>
              </div>
              
              <div className="md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="error">Erro</option>
                  <option value="outdated">Desatualizado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Dependências */}
        <Card>
          <CardHeader>
            <CardTitle>Dependências ({filteredDependencies.length})</CardTitle>
            <CardDescription>
              Capacidade atual: <Badge variant="outline">{currentCapacity.toUpperCase()}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDependencies.map((dep) => (
                <div key={dep.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(dep.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{dep.name}</h3>
                          <Badge variant="outline" className="text-xs">v{dep.version}</Badge>
                          {dep.updateAvailable && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Atualização disponível
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dep.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📍 {dep.location}</span>
                          <span>📅 Instalado em {new Date(dep.installationDate).toLocaleDateString('pt-BR')}</span>
                          {dep.memoryUsage && dep.memoryUsage > 0 && (
                            <span>💾 {dep.memoryUsage}MB</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(dep.status)}
                      <Badge 
                        variant={dep.status === "active" ? "default" : 
                                dep.status === "error" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {dep.status === "active" ? "Ativo" :
                         dep.status === "inactive" ? "Inativo" :
                         dep.status === "error" ? "Erro" : "Desatualizado"}
                      </Badge>
                    </div>
                  </div>
                  
                  {(dep.criticalIssues || dep.warnings) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm">
                        {dep.criticalIssues && dep.criticalIssues > 0 && (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {dep.criticalIssues} problema(s) crítico(s)
                          </span>
                        )}
                        {dep.warnings && dep.warnings > 0 && (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {dep.warnings} aviso(s)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Capacidades suportadas:</span>
                      <div className="flex gap-1">
                        {dep.capacitiesSupported.map(capacity => (
                          <Badge 
                            key={capacity} 
                            variant={capacity === currentCapacity ? "default" : "outline"}
                            className="text-xs"
                          >
                            {capacity.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDependencies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma dependência encontrada com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}