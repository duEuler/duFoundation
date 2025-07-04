import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Cog, Package, Server, Shield } from "lucide-react";
import { z } from "zod";

const setupSchema = z.object({
  setupPassword: z.string().min(1, "Senha obrigatória"),
  organizationName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  environment: z.enum(["development", "staging", "production"]),
  foundationCapacity: z.string().min(1, "Capacidade obrigatória"),
  maxConcurrentUsers: z.number().min(1).max(1000000),
  cacheTTL: z.number().min(60).max(86400),
  adminUsername: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function FoundationSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCapacity, setSelectedCapacity] = useState("small");

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      setupPassword: "",
      organizationName: "",
      environment: "development",
      foundationCapacity: "small",
      maxConcurrentUsers: 1000,
      cacheTTL: 3600,
      adminUsername: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const setupMutation = useMutation({
    mutationFn: (data: SetupFormData) => apiRequest("/api/setup", {
      method: "POST",
      body: data,
    }),
    onSuccess: () => {
      toast({
        title: "Foundation configurado com sucesso!",
        description: "Carregando sistema completo...",
      });
      
      // Aqui será feito o carregamento do sistema completo
      setTimeout(() => {
        window.location.reload(); // Recarrega para ativar o sistema completo
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na configuração",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const capacityOptions = [
    { value: "nano", label: "Nano (1-1K usuários)", users: "1-1,000", resources: "512MB RAM, 1 Core" },
    { value: "micro", label: "Micro (1K-10K usuários)", users: "1,000-10,000", resources: "1GB RAM, 2 Cores" },
    { value: "small", label: "Small (10K-50K usuários)", users: "10,000-50,000", resources: "2GB RAM, 4 Cores" },
    { value: "medium", label: "Medium (50K-200K usuários)", users: "50,000-200,000", resources: "4GB RAM, 6 Cores" },
    { value: "large", label: "Large (200K-1M usuários)", users: "200,000-1,000,000", resources: "8GB RAM, 8 Cores" },
    { value: "enterprise", label: "Enterprise (1M+ usuários)", users: "1,000,000+", resources: "16GB+ RAM, 16+ Cores" },
  ];

  const onSubmit = (data: SetupFormData) => {
    setupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-white text-3xl" size={40} />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DuEuler Foundation v3.0
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Configuração Inicial do Sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Senha de Setup */}
            <div className="space-y-2">
              <Label htmlFor="setupPassword" className="text-sm font-medium">
                <Shield className="inline mr-2" size={16} />
                Senha de Configuração
              </Label>
              <Input
                id="setupPassword"
                type="password"
                placeholder="Digite a senha de setup"
                {...form.register("setupPassword")}
                className="h-12"
              />
              {form.formState.errors.setupPassword && (
                <p className="text-red-500 text-sm">{form.formState.errors.setupPassword.message}</p>
              )}
            </div>

            {/* Informações da Organização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nome da Organização</Label>
                <Input
                  id="organizationName"
                  placeholder="Empresa XYZ"
                  {...form.register("organizationName")}
                  className="h-12"
                />
                {form.formState.errors.organizationName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.organizationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Ambiente</Label>
                <Select onValueChange={(value) => form.setValue("environment", value as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Desenvolvimento</SelectItem>
                    <SelectItem value="staging">Teste</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacidade Foundation */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                <Server className="inline mr-2" size={16} />
                Capacidade Foundation
              </Label>
              <Select 
                onValueChange={(value) => {
                  setSelectedCapacity(value);
                  form.setValue("foundationCapacity", value);
                  // Ajustar usuários automaticamente baseado na capacidade
                  const capacity = capacityOptions.find(c => c.value === value);
                  if (capacity) {
                    const maxUsers = capacity.value === "nano" ? 1000 :
                                   capacity.value === "micro" ? 10000 :
                                   capacity.value === "small" ? 50000 :
                                   capacity.value === "medium" ? 200000 :
                                   capacity.value === "large" ? 1000000 : 5000000;
                    form.setValue("maxConcurrentUsers", Math.min(maxUsers, form.getValues("maxConcurrentUsers")));
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione a capacidade" />
                </SelectTrigger>
                <SelectContent>
                  {capacityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.resources}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCapacity && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Capacidade Selecionada: {selectedCapacity.toUpperCase()}</h4>
                  <p className="text-sm text-blue-700">
                    {capacityOptions.find(c => c.value === selectedCapacity)?.resources}
                  </p>
                  <p className="text-sm text-blue-700">
                    Suporte: {capacityOptions.find(c => c.value === selectedCapacity)?.users} usuários
                  </p>
                </div>
              )}
            </div>

            {/* Configurações de Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentUsers">Máx. Usuários Simultâneos</Label>
                <Input
                  id="maxConcurrentUsers"
                  type="number"
                  placeholder="1000"
                  {...form.register("maxConcurrentUsers", { valueAsNumber: true })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheTTL">Cache TTL (segundos)</Label>
                <Input
                  id="cacheTTL"
                  type="number"
                  placeholder="3600"
                  {...form.register("cacheTTL", { valueAsNumber: true })}
                  className="h-12"
                />
              </div>
            </div>

            {/* Administrador */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Conta de Administrador</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Username</Label>
                    <Input
                      id="adminUsername"
                      placeholder="admin"
                      {...form.register("adminUsername")}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@empresa.com"
                      {...form.register("adminEmail")}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Senha do Administrador</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Digite uma senha segura"
                    {...form.register("adminPassword")}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? (
                <>
                  <Cog className="mr-2 h-4 w-4 animate-spin" />
                  Configurando Foundation...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Instalar Foundation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}