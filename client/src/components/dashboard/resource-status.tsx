import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, MemoryStick, Activity, AlertTriangle } from "lucide-react";

export function ResourceStatus() {
  const { data: foundationConfig } = useQuery({
    queryKey: ["/api/foundation/config"],
    refetchInterval: 60000,
  });

  const { data: systemInfo } = useQuery({
    queryKey: ["/api/system/hardware-info"],
    refetchInterval: 30000,
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/monitoring/metrics"],
    refetchInterval: 10000,
  });

  if (!foundationConfig || !systemInfo) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Activity className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Carregando informações do servidor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = foundationConfig as any;
  const hardware = systemInfo as any;
  const systemMetrics = metrics as any;
  const currentCapacity = config.currentCapacity?.toUpperCase();
  const foundationResources = config.foundationConfig?.resources;

  // Calculate usage percentages
  const cpuUsage = systemMetrics?.cpu_usage || 0;
  const memoryUsage = systemMetrics ? 
    Math.round((systemMetrics.memory_usage / systemMetrics.memory_total) * 100) : 0;

  // Check compatibility between Foundation and actual hardware
  const cpuCompatible = hardware.cpuCores >= (foundationResources?.cpuCores || 0);
  const ramCompatible = hardware.totalMemoryGB >= (foundationResources?.ramMB / 1024 || 0);
  const storageCompatible = hardware.totalStorageGB >= (foundationResources?.storageGB || 0);

  return (
    <Card className="mb-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-600 text-white font-semibold">
              Servidor Real
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Foundation: {currentCapacity}
            </span>
            {(!cpuCompatible || !ramCompatible || !storageCompatible) && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {/* CPU */}
            <div className="flex items-center gap-2">
              <Cpu className={`h-4 w-4 ${cpuCompatible ? 'text-blue-600' : 'text-orange-500'}`} />
              <div className="text-sm">
                <span className="font-medium">{hardware.cpuCores} cores</span>
                <div className="text-xs text-gray-500">
                  {cpuUsage.toFixed(1)}% em uso
                </div>
              </div>
            </div>

            {/* RAM */}
            <div className="flex items-center gap-2">
              <MemoryStick className={`h-4 w-4 ${ramCompatible ? 'text-green-600' : 'text-orange-500'}`} />
              <div className="text-sm">
                <span className="font-medium">{hardware.totalMemoryGB}GB RAM</span>
                <div className="text-xs text-gray-500">
                  {memoryUsage}% em uso
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center gap-2">
              <HardDrive className={`h-4 w-4 ${storageCompatible ? 'text-purple-600' : 'text-orange-500'}`} />
              <div className="text-sm">
                <span className="font-medium">{hardware.totalStorageGB}GB {hardware.storageType}</span>
                <div className="text-xs text-gray-500">
                  {hardware.freeStorageGB}GB livre
                </div>
              </div>
            </div>

            {/* Network */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <div className="text-sm">
                <span className="font-medium">{hardware.networkSpeed}Mbps</span>
                <div className="text-xs text-gray-500">
                  {hardware.networkType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}