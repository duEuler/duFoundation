import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Layers, 
  Users, 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  AlertTriangle, 
  CheckCircle, 
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
  Shield,
  Globe
} from "lucide-react";
import { useState } from "react";

interface FoundationCapacity {
  key: string;
  name: string;
  description: string;
  userRange: { min: number; max: number };
  resources: {
    ramMB: number;
    cpuCores: number;
    storageGB: number;
    bandwidthMbps?: number;
  };
  useCases: string[];
}

export default function CapacitiesPage() {
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);

  const { data: capacities } = useQuery<FoundationCapacity[]>({
    queryKey: ['/api/foundation/capacities'],
  });

  const { data: systemConfig } = useQuery({
    queryKey: ['/api/foundation/config'],
  });

  const { data: hardwareInfo } = useQuery({
    queryKey: ['/api/system/hardware-info'],
  });

  const currentCapacity = (systemConfig as any)?.systemConfig?.foundationCapacity || "large";
  const currentCapacityData = capacities?.find(c => c.key === currentCapacity);

  // Estatísticas
  const stats = {
    totalCapacities: capacities?.length || 6,
    currentLevel: currentCapacity.toUpperCase(),
    compatibleCapacities: 0,
    incompatibleCapacities: 0,
  };

  // Calcular compatibilidades
  if (capacities && hardwareInfo) {
    capacities.forEach(capacity => {
      const ramCompatible = (hardwareInfo as any).totalMemoryGB >= (capacity.resources.ramMB / 1024);
      const cpuCompatible = (hardwareInfo as any).cpuCores >= capacity.resources.cpuCores;
      
      if (ramCompatible && cpuCompatible) {
        stats.compatibleCapacities++;
      } else {
        stats.incompatibleCapacities++;
      }
    });
  }

  const alerts = [];
  if (stats.incompatibleCapacities > 0) {
    alerts.push({
      type: "warning" as const,
      message: `${stats.incompatibleCapacities} capacidades incompatíveis com hardware atual`,
      count: stats.incompatibleCapacities
    });
  }

  const totals = {
    activeUsers: 1,
    totalCapacities: stats.totalCapacities,
    activeAlerts: alerts.length,
    systemHealth: stats.incompatibleCapacities > 2 ? "degraded" as const : "healthy" as const
  };

  const getCapacityColor = (capacity: string) => {
    const colors = {
      nano: "bg-gray-100 text-gray-700 border-gray-300",
      micro: "bg-blue-100 text-blue-700 border-blue-300",
      small: "bg-green-100 text-green-700 border-green-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      large: "bg-orange-100 text-orange-700 border-orange-300",
      enterprise: "bg-red-100 text-red-700 border-red-300"
    };
    return colors[capacity as keyof typeof colors] || colors.small;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const checkCompatibility = (capacity: FoundationCapacity) => {
    if (!hardwareInfo) return { compatible: true, issues: [] };
    
    const issues = [];
    const hw = hardwareInfo as any;
    
    const ramRequired = capacity.resources.ramMB / 1024;
    const ramAvailable = hw.totalMemoryGB;
    
    if (ramAvailable < ramRequired) {
      issues.push(`Memória: ${ramRequired}GB necessário, ${ramAvailable}GB disponível`);
    }
    
    if (hw.cpuCores < capacity.resources.cpuCores) {
      issues.push(`CPU: ${capacity.resources.cpuCores} cores necessários, ${hw.cpuCores} disponíveis`);
    }
    
    return {
      compatible: issues.length === 0,
      issues
    };
  };

  return (
    <MainLayout 
      title="Capacidades Foundation" 
      totals={totals}
      alerts={alerts}
    >
      <div className="space-y-6">
        {/* Status da Capacidade Atual */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Capacidade Atual: {currentCapacity.toUpperCase()}
                </CardTitle>
                <CardDescription>
                  {currentCapacityData?.description}
                </CardDescription>
              </div>
              <Badge variant="default" className="text-sm px-3 py-1">
                ATIVA
              </Badge>
            </div>
          </CardHeader>
          {currentCapacityData && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {formatNumber(currentCapacityData.userRange.min)}-{formatNumber(currentCapacityData.userRange.max)}
                  </div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                </div>
                
                <div className="text-center">
                  <MemoryStick className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{(currentCapacityData.resources.ramMB / 1024).toFixed(0)}GB</div>
                  <p className="text-sm text-muted-foreground">RAM</p>
                </div>
                
                <div className="text-center">
                  <Cpu className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold">{currentCapacityData.resources.cpuCores}</div>
                  <p className="text-sm text-muted-foreground">CPU Cores</p>
                </div>
                
                <div className="text-center">
                  <HardDrive className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">{currentCapacityData.resources.storageGB}GB</div>
                  <p className="text-sm text-muted-foreground">Storage</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Grid de Todas as Capacidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capacities?.map((capacity) => {
            const isActive = capacity.key === currentCapacity;
            const compatibility = checkCompatibility(capacity);
            
            return (
              <Card 
                key={capacity.key} 
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 
                  selectedCapacity === capacity.key ? 'ring-2 ring-gray-300' : ''
                }`}
                onClick={() => setSelectedCapacity(selectedCapacity === capacity.key ? null : capacity.key)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getCapacityColor(capacity.key)} border`}>
                      {capacity.key.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {isActive && <Badge variant="default">ATUAL</Badge>}
                      {compatibility.compatible ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{capacity.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {capacity.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Recursos */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{formatNumber(capacity.userRange.min)}-{formatNumber(capacity.userRange.max)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-green-500" />
                      <span>{(capacity.resources.ramMB / 1024).toFixed(0)}GB RAM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-orange-500" />
                      <span>{capacity.resources.cpuCores} cores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-500" />
                      <span>{capacity.resources.storageGB}GB</span>
                    </div>
                  </div>

                  {/* Compatibilidade */}
                  <div className="pt-3 border-t">
                    {compatibility.compatible ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Compatível</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Incompatível</span>
                        </div>
                        {compatibility.issues.map((issue, idx) => (
                          <p key={idx} className="text-xs text-red-500 ml-6">{issue}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Detalhes expandidos */}
                  {selectedCapacity === capacity.key && (
                    <div className="pt-3 border-t space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Casos de Uso:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {capacity.useCases.map((useCase, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-blue-500">•</span>
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {!isActive && compatibility.compatible && (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implementar mudança de capacidade
                            console.log(`Switching to ${capacity.key}`);
                          }}
                        >
                          {capacity.userRange.max > (currentCapacityData?.userRange.max || 0) ? (
                            <>
                              <ArrowUp className="h-4 w-4 mr-1" />
                              Fazer Upgrade
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-4 w-4 mr-1" />
                              Fazer Downgrade
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparação de Hardware */}
        {hardwareInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Comparação Hardware vs Capacidades
              </CardTitle>
              <CardDescription>
                Análise de compatibilidade entre hardware atual e capacidades Foundation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Hardware Atual</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CPU:</span>
                        <span className="font-medium">{(hardwareInfo as any).cpuCores} cores</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM:</span>
                        <span className="font-medium">{(hardwareInfo as any).totalMemoryGB}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Modelo CPU:</span>
                        <span className="font-medium text-xs">{(hardwareInfo as any).cpuModel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Status de Compatibilidade</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Capacidades Compatíveis:</span>
                        <Badge variant="default">{stats.compatibleCapacities}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Capacidades Incompatíveis:</span>
                        <Badge variant="destructive">{stats.incompatibleCapacities}</Badge>
                      </div>
                      <Progress 
                        value={(stats.compatibleCapacities / stats.totalCapacities) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}