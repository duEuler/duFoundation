import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Cpu, Database, Users, Zap, Loader2 } from "lucide-react";

interface ReconfigureData {
  foundationCapacity: string;
}

export function FoundationConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ["/api/foundation/config"],
    refetchInterval: 60000,
  });

  const { data: capacities } = useQuery({
    queryKey: ["/api/foundation/capacities"],
  });

  const form = useForm<ReconfigureData>({
    defaultValues: {
      foundationCapacity: (currentConfig as any)?.currentCapacity || "large",
    },
  });

  // Reset form when opening edit mode with current values
  const handleEditClick = () => {
    if (currentConfig) {
      const config = currentConfig as any;
      form.setValue("foundationCapacity", config.currentCapacity);
    }
    setIsEditing(true);
  };

  const reconfigureMutation = useMutation({
    mutationFn: async (data: ReconfigureData) => {
      const response = await apiRequest("POST", "/api/foundation/reconfigure", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Configuração atualizada!",
        description: "A capacidade da duEuler Foundation foi alterada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/foundation/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/metrics"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na reconfiguração",
        description: error.message || "Erro ao alterar configuração da Foundation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReconfigureData) => {
    reconfigureMutation.mutate(data);
  };

  const getCapacityColor = (capacity: string) => {
    const colors: Record<string, string> = {
      nano: "bg-blue-100 text-blue-800",
      micro: "bg-green-100 text-green-800",
      small: "bg-yellow-100 text-yellow-800",
      medium: "bg-orange-100 text-orange-800",
      large: "bg-red-100 text-red-800",
      enterprise: "bg-purple-100 text-purple-800",
    };
    return colors[capacity] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Foundation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentFoundationConfig = (currentConfig as any)?.foundationConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração da Foundation
        </CardTitle>
        <CardDescription>
          Gerencie a capacidade e recursos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing ? (
          <>
            {/* Current Configuration Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Capacidade Atual</span>
                <Badge className={getCapacityColor((currentConfig as any)?.currentCapacity || "small")}>
                  {((currentConfig as any)?.currentCapacity || "small").toUpperCase()}
                </Badge>
              </div>

              {currentFoundationConfig && (
                <>
                  <div className="text-sm text-muted-foreground">
                    {currentFoundationConfig.description}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">Usuários Suportados</span>
                      </div>
                      <div className="text-sm font-medium">
                        {currentFoundationConfig.userRange.min.toLocaleString()} - {currentFoundationConfig.userRange.max.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">RAM / CPU</span>
                      </div>
                      <div className="text-sm font-medium">
                        {currentFoundationConfig.resources.ramMB}MB / {currentFoundationConfig.resources.cpuCores} cores
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Casos de Uso Ideais:</div>
                    <div className="flex flex-wrap gap-1">
                      {currentFoundationConfig.useCases.map((useCase: string) => (
                        <Badge key={useCase} variant="outline" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleEditClick}
              className="w-full"
              variant="outline"
            >
              <Zap className="mr-2 h-4 w-4" />
              Reconfigurar Foundation
            </Button>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foundationCapacity">Nova Capacidade</Label>
                <Select
                  value={form.watch("foundationCapacity")}
                  onValueChange={(value) => form.setValue("foundationCapacity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a capacidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {(capacities as any)?.map((capacity: any) => (
                      <SelectItem key={capacity.key} value={capacity.key}>
                        {capacity.name.toUpperCase()} ({capacity.userRange.min.toLocaleString()}-{capacity.userRange.max.toLocaleString()} usuários)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={reconfigureMutation.isPending}
                  className="flex-1"
                >
                  {reconfigureMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    "Aplicar Configuração"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={reconfigureMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}