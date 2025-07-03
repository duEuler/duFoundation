import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, MemoryStick, Activity } from "lucide-react";

export function ResourceStatus() {
  const { data: foundationConfig } = useQuery({
    queryKey: ["/api/foundation/config"],
    refetchInterval: 60000,
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/monitoring/metrics"],
    refetchInterval: 10000,
  });

  if (!foundationConfig) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Activity className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Carregando recursos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = foundationConfig as any;
  const resources = config.foundationConfig?.resources;
  const systemMetrics = metrics as any;
  const currentCapacity = config.currentCapacity?.toUpperCase();

  // Calculate usage percentages
  const cpuUsage = systemMetrics?.cpu_usage || 0;
  const memoryUsage = systemMetrics ? 
    Math.round((systemMetrics.memory_usage / systemMetrics.memory_total) * 100) : 0;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white font-semibold">
              Capacidade {currentCapacity}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              duEuler Foundation v3.0
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* CPU */}
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <span className="font-medium">{resources?.cpuCores || 0} cores</span>
                <div className="text-xs text-gray-500">
                  {cpuUsage.toFixed(1)}% em uso
                </div>
              </div>
            </div>

            {/* RAM */}
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <span className="font-medium">
                  {resources?.ramMB ? Math.round(resources.ramMB / 1024) : 0}GB RAM
                </span>
                <div className="text-xs text-gray-500">
                  {memoryUsage}% em uso
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              <div className="text-sm">
                <span className="font-medium">{resources?.storageGB || 0}GB SSD</span>
                <div className="text-xs text-gray-500">
                  Alta velocidade
                </div>
              </div>
            </div>

            {/* Bandwidth */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <span className="font-medium">{resources?.bandwidthMbps || 0}Mbps</span>
                <div className="text-xs text-gray-500">
                  Banda dedicada
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}