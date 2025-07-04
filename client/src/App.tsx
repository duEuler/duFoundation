import { Switch, Route } from "wouter";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Settings, Users, Shield, Zap } from "lucide-react";
import { useState } from "react";
import NotFound from "@/pages/not-found";

type UserLevel = 'beginner' | 'developer' | 'expert' | null;
type AppMode = 'level-selection' | 'setup-wizard' | 'simple-interface' | 'full-app';

interface FoundationStatus {
  installed: boolean;
  capacity: string | null;
  organizationName: string | null;
  environment: string | null;
}

interface SystemHealth {
  database: string;
  server: string;
  monitoring: string;
}

// Interface de seleção de nível de usuário
function UserLevelSelector({ onLevelSelect }: { onLevelSelect: (level: UserLevel) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DuEuler Foundation Management System
          </h1>
          <p className="text-xl text-gray-600">
            Escolha seu nível de experiência para uma interface personalizada
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Usuário Básico */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onLevelSelect('beginner')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Usuário Básico</CardTitle>
              <CardDescription>Interface simples com 5 botões principais</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Instalação em 1 clique</li>
                <li>• Status do sistema</li>
                <li>• Configurações básicas</li>
                <li>• Suporte e ajuda</li>
                <li>• Monitoramento simples</li>
              </ul>
            </CardContent>
          </Card>

          {/* Desenvolvedor */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onLevelSelect('developer')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Desenvolvedor</CardTitle>
              <CardDescription>CLI simplificado + interface web</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Comandos CLI principais</li>
                <li>• Configuração avançada</li>
                <li>• Logs e debugging</li>
                <li>• API endpoints</li>
                <li>• Métricas detalhadas</li>
              </ul>
            </CardContent>
          </Card>

          {/* Especialista */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onLevelSelect('expert')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Especialista</CardTitle>
              <CardDescription>Acesso completo ao sistema original</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 2.825 arquivos disponíveis</li>
                <li>• 15 subsistemas integrados</li>
                <li>• Controle total da arquitetura</li>
                <li>• Todas as funcionalidades</li>
                <li>• Customização completa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Interface simplificada para usuários básicos
function SimpleInterface({ foundationStatus, systemHealth, onInstall }: { 
  foundationStatus: FoundationStatus;
  systemHealth: SystemHealth;
  onInstall: () => void;
}) {
  const [installing, setInstalling] = useState(false);

  const installMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/foundation/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: 'SMALL', quickSetup: true, wizard: true })
      });
      if (!response.ok) throw new Error('Falha na instalação');
      return response.json();
    },
    onSuccess: () => {
      setInstalling(false);
      onInstall();
      queryClient.invalidateQueries({ queryKey: ['/api/foundation/status'] });
    },
    onError: () => {
      setInstalling(false);
    }
  });

  const handleInstall = () => {
    setInstalling(true);
    installMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DuEuler Foundation
          </h1>
          <p className="text-gray-600">Interface Simplificada</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Status do Foundation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge className={foundationStatus.installed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {foundationStatus.installed ? 'Instalado' : 'Não Instalado'}
                  </Badge>
                </div>
                {foundationStatus.installed && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Capacidade:</span>
                      <span className="font-medium">{foundationStatus.capacity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Organização:</span>
                      <span className="font-medium">{foundationStatus.organizationName}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Saúde do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Database:</span>
                  <Badge className={getStatusColor(systemHealth.database)}>
                    {systemHealth.database}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Servidor:</span>
                  <Badge className={getStatusColor(systemHealth.server)}>
                    {systemHealth.server}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monitoramento:</span>
                  <Badge className={getStatusColor(systemHealth.monitoring)}>
                    {systemHealth.monitoring}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          {!foundationStatus.installed ? (
            <Button 
              size="lg" 
              className="h-16 text-lg"
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Instalar Foundation
                </>
              )}
            </Button>
          ) : (
            <>
              <Button size="lg" className="h-16 text-lg" variant="outline">
                <CheckCircle className="mr-2 h-5 w-5" />
                Status do Sistema
              </Button>
              <Button size="lg" className="h-16 text-lg" variant="outline">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </Button>
              <Button size="lg" className="h-16 text-lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Gerenciar Usuários
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal da aplicação
function AppContent() {
  const [userLevel, setUserLevel] = useState<UserLevel>(null);
  const [mode, setMode] = useState<AppMode>('level-selection');

  // Fetch foundation status
  const { data: foundationStatus, isLoading: isLoadingStatus } = useQuery<FoundationStatus>({
    queryKey: ['/api/foundation/status'],
    refetchInterval: 5000
  });

  // Fetch system health
  const { data: systemHealth, isLoading: isLoadingHealth } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
    refetchInterval: 5000
  });

  const handleLevelSelect = (level: UserLevel) => {
    setUserLevel(level);
    switch (level) {
      case 'beginner':
        setMode('simple-interface');
        break;
      case 'developer':
        setMode('setup-wizard');
        break;
      case 'expert':
        setMode('full-app');
        break;
    }
  };

  const handleInstallComplete = () => {
    // Refresh data after installation
    queryClient.invalidateQueries({ queryKey: ['/api/foundation/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/system/health'] });
  };

  // Loading states
  if (isLoadingStatus || isLoadingHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Show level selection if no level chosen
  if (mode === 'level-selection') {
    return <UserLevelSelector onLevelSelect={handleLevelSelect} />;
  }

  // Show simple interface for beginners
  if (mode === 'simple-interface' && foundationStatus && systemHealth) {
    return (
      <SimpleInterface 
        foundationStatus={foundationStatus} 
        systemHealth={systemHealth}
        onInstall={handleInstallComplete}
      />
    );
  }

  // Show setup wizard for developers
  if (mode === 'setup-wizard') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Modo Desenvolvedor</CardTitle>
            <CardDescription>
              Interface CLI simplificada em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Esta interface será implementada na Fase 2 do plano de simplificação.
            </p>
            <Button onClick={() => setMode('level-selection')} variant="outline">
              Voltar à seleção
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show full app for experts
  if (mode === 'full-app') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Modo Especialista</CardTitle>
            <CardDescription>
              Acesso completo ao sistema original
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Redirecionando para o sistema completo com 2.825 arquivos e 15 subsistemas.
            </p>
            <Button onClick={() => setMode('level-selection')} variant="outline">
              Voltar à seleção
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div>Erro: Estado inválido</div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppContent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;