import React, { useState } from "react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FoundationCapacity {
  key: string;
  name: string;
  description: string;
  userRange: { min: number; max: number };
  resources: {
    ramMB: number;
    cpuCores: number;
    storageGB: number;
    bandwidthMbps: number;
  };
  performance: {
    responseTimeTargetMs: number;
    throughputRps: number;
    availabilityTarget: number;
    errorRateThreshold: number;
  };
  monitoring: {
    scrapeInterval: string;
    retentionDays: number;
    alertThresholds: {
      cpuPercent: number;
      memoryPercent: number;
      responseTimeMs: number;
    };
  };
  useCases: string[];
}

export default function CapacitiesPage() {
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [changeCapacityDialog, setChangeCapacityDialog] = useState(false);
  const [targetCapacity, setTargetCapacity] = useState<string>("");

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

  // Calcular compatibilidade com o hardware atual
  const checkCompatibility = (capacity: FoundationCapacity) => {
    const currentRam = hardwareInfo?.ramMB || 8192;
    const currentCpu = hardwareInfo?.cpuCores || 4;
    
    const ramUsage = (capacity.resources.ramMB / currentRam) * 100;
    const cpuUsage = (capacity.resources.cpuCores / currentCpu) * 100;
    
    return {
      ramUsage: Math.min(ramUsage, 100),
      cpuUsage: Math.min(cpuUsage, 100),
      compatible: ramUsage <= 90 && cpuUsage <= 90
    };
  };

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case "nano": return "bg-gray-100 text-gray-800";
      case "micro": return "bg-blue-100 text-blue-800";
      case "small": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "large": return "bg-orange-100 text-orange-800";
      case "enterprise": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUsageBadgeColor = (usage: number) => {
    if (usage <= 50) return "bg-green-100 text-green-800";
    if (usage <= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getUsageBadgeText = (usage: number) => {
    if (usage <= 50) return "Baixo";
    if (usage <= 75) return "Moderado";
    return "Alto";
  };

  const alerts = [
    ...(currentCapacityData && checkCompatibility(currentCapacityData).ramUsage > 80 ? [{
      type: "warning" as const,
      message: "Uso de RAM acima de 80% - considere upgrade",
      count: 1
    }] : []),
    ...(currentCapacityData && checkCompatibility(currentCapacityData).cpuUsage > 80 ? [{
      type: "warning" as const,
      message: "Uso de CPU acima de 80% - considere upgrade",
      count: 1
    }] : [])
  ];

  const totals = {
    activeUsers: 1,
    totalCapacities: capacities?.length || 6,
    activeAlerts: alerts.length,
    systemHealth: alerts.length > 0 ? "degraded" as const : "healthy" as const
  };

  return (
    <MainLayout 
      title="Capacidades Foundation"
      totals={totals}
      alerts={alerts}
    >
      <div className="space-y-6">
        {/* Capacidade Atual */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  Capacidade Atual
                </CardTitle>
                <CardDescription>
                  Configuração ativa do sistema Foundation
                </CardDescription>
              </div>
              <Badge className={`${getCapacityColor(currentCapacity)} text-lg px-4 py-2`}>
                {currentCapacity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          {currentCapacityData && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {currentCapacityData.userRange.min.toLocaleString()}-{currentCapacityData.userRange.max.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                </div>
                
                <div className="text-center">
                  <MemoryStick className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{(currentCapacityData.resources.ramMB / 1024).toFixed(1)}GB</div>
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
          {capacities?.map((capacity): React.ReactElement => {
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
                    <div className="flex items-center gap-2">
                      {isActive && <Badge variant="default">ATUAL</Badge>}
                      
                      {/* Badge de uso de CPU */}
                      <Badge className={`${getUsageBadgeColor(compatibility.cpuUsage)} text-xs px-2 py-1`}>
                        CPU {getUsageBadgeText(compatibility.cpuUsage)}
                      </Badge>
                      
                      {/* Badge de uso de RAM */}
                      <Badge className={`${getUsageBadgeColor(compatibility.ramUsage)} text-xs px-2 py-1`}>
                        RAM {getUsageBadgeText(compatibility.ramUsage)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{capacity.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {capacity.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Recursos */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Recursos
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>RAM:</span>
                          <span className="font-medium">{(capacity.resources.ramMB / 1024).toFixed(1)}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU:</span>
                          <span className="font-medium">{capacity.resources.cpuCores} cores</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span className="font-medium">{capacity.resources.storageGB}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bandwidth:</span>
                          <span className="font-medium">{capacity.resources.bandwidthMbps}Mbps</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Performance
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Response Time:</span>
                          <span className="font-medium">{capacity.performance.responseTimeTargetMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="font-medium">{capacity.performance.throughputRps} RPS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Availability:</span>
                          <span className="font-medium">{(capacity.performance.availabilityTarget * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Compatibilidade */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        {compatibility.compatible ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        }
                        Compatibilidade
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Uso de RAM</span>
                            <span>{compatibility.ramUsage.toFixed(0)}%</span>
                          </div>
                          <Progress value={compatibility.ramUsage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Uso de CPU</span>
                            <span>{compatibility.cpuUsage.toFixed(0)}%</span>
                          </div>
                          <Progress value={compatibility.cpuUsage} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Casos de Uso */}
                    {selectedCapacity === capacity.key && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Casos de Uso
                        </h4>
                        <ul className="text-xs space-y-1">
                          {capacity.useCases.map((useCase, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Botão de Mudança */}
                    {!isActive && compatibility.compatible && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetCapacity(capacity.key);
                          setChangeCapacityDialog(true);
                        }}
                      >
                        {capacity.key === "enterprise" ? "Solicitar Upgrade" : 
                         capacity.userRange.max > (currentCapacityData?.userRange.max || 0) ? "Upgrade" : "Downgrade"}
                      </Button>
                    )}
                    
                    {!compatibility.compatible && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Hardware insuficiente para esta capacidade
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Dialog de Mudança de Capacidade */}
      <Dialog open={changeCapacityDialog} onOpenChange={setChangeCapacityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Capacidade Foundation</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja alterar a capacidade de {currentCapacity.toUpperCase()} para {targetCapacity.toUpperCase()}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta operação pode causar indisponibilidade temporária do sistema durante a reconfiguração.
              </AlertDescription>
            </Alert>
            
            {targetCapacity && capacities && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Alterações que serão aplicadas:</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const target = capacities.find(c => c.key === targetCapacity);
                    const current = capacities.find(c => c.key === currentCapacity);
                    if (!target || !current) return null;
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Usuários:</span>
                          <span>{current.userRange.max.toLocaleString()} → {target.userRange.max.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RAM:</span>
                          <span>{(current.resources.ramMB / 1024).toFixed(1)}GB → {(target.resources.ramMB / 1024).toFixed(1)}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU:</span>
                          <span>{current.resources.cpuCores} → {target.resources.cpuCores} cores</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span>{current.resources.storageGB}GB → {target.resources.storageGB}GB</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeCapacityDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Implementar mudança de capacidade
                console.log(`Alterando capacidade para: ${targetCapacity}`);
                setChangeCapacityDialog(false);
              }}
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}