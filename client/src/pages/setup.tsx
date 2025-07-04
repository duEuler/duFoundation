import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setupSchema, type SetupRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cog, Loader2 } from "lucide-react";

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SetupRequest>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      setupPassword: "",
      organizationName: "DuEuler Foundation",
      environment: "development",
      foundationCapacity: "small",
      maxConcurrentUsers: 10000,
      cacheTTL: 300,
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (data: SetupRequest) => {
      const response = await apiRequest("POST", "/api/setup", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sistema configurado com sucesso!",
        description: "Redirecionando para a página de login...",
      });
      // Immediate redirect instead of setTimeout
      setLocation("/foundation/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro na configuração",
        description: error.message || "Senha de configuração inválida",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SetupRequest) => {
    setupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen dueuler-gradient flex items-center justify-center px-4">
      <Card className="w-full max-w-md card-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 dueuler-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Cog className="text-white text-2xl" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configuração Inicial
          </CardTitle>
          <CardDescription>
            Configure o sistema DuEuler Foundation
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="setupPassword">Senha de Setup</Label>
              <Input
                id="setupPassword"
                type="password"
                placeholder="Digite a senha de configuração"
                {...form.register("setupPassword")}
              />
              {form.formState.errors.setupPassword && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.setupPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">Nome da Organização</Label>
              <Input
                id="organizationName"
                placeholder="DuEuler Foundation"
                {...form.register("organizationName")}
              />
              {form.formState.errors.organizationName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.organizationName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={form.watch("environment")}
                onValueChange={(value) => form.setValue("environment", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Desenvolvimento</SelectItem>
                  <SelectItem value="staging">Homologação</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundationCapacity">Capacidade da duEuler Foundation</Label>
              <Select
                value={form.watch("foundationCapacity")}
                onValueChange={(value) => form.setValue("foundationCapacity", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a capacidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nano">Nano (1-1K usuários) - Dentista, Advogado</SelectItem>
                  <SelectItem value="micro">Micro (1K-10K usuários) - Clínica, Escritório</SelectItem>
                  <SelectItem value="small">Small (10K-50K usuários) - Startup, Regional</SelectItem>
                  <SelectItem value="medium">Medium (50K-200K usuários) - Empresa Média</SelectItem>
                  <SelectItem value="large">Large (200K-1M usuários) - Grande Empresa</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1M+ usuários) - Corporação</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                Esta configuração determina os recursos e otimizações do sistema
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentUsers" className="text-xs">
                  Máx. Usuários Simultâneos
                </Label>
                <Input
                  id="maxConcurrentUsers"
                  type="number"
                  className="text-sm"
                  {...form.register("maxConcurrentUsers", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cacheTTL" className="text-xs">
                  Cache TTL (segundos)
                </Label>
                <Input
                  id="cacheTTL"
                  type="number"
                  className="text-sm"
                  {...form.register("cacheTTL", { valueAsNumber: true })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full dueuler-bg-primary hover:bg-blue-700 text-white"
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Configurar Sistema"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Configurações do Sistema
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Sistema de autenticação multinível</li>
              <li>• Cache inteligente para performance</li>
              <li>• Métricas em tempo real</li>
              <li>• Gestão de sessões otimizada</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
