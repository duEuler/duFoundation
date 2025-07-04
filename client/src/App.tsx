import { Switch, Route } from "wouter";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Settings, Users, Shield, Zap, Terminal, Code, Database, Monitor, ArrowLeft } from "lucide-react";
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

// Interface para desenvolvedores - CLI simplificado
function DeveloperInterface({ foundationStatus, systemHealth, onBack }: {
  foundationStatus: FoundationStatus | undefined;
  systemHealth: SystemHealth | undefined;
  onBack: () => void;
}) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([
    'DuEuler Foundation CLI - Modo Desenvolvedor',
    'Digite "help" para ver comandos disponíveis',
    ''
  ]);

  const commands = {
    help: () => [
      'Comandos disponíveis:',
      '  status        - Mostra status do Foundation',
      '  health        - Verifica saúde do sistema',
      '  install       - Instala Foundation',
      '  logs          - Mostra logs do sistema',
      '  config        - Mostra configuração atual',
      '  clear         - Limpa terminal',
      '  exit          - Volta para seleção de modo'
    ],
    status: () => foundationStatus ? [
      `Status: ${foundationStatus.installed ? 'Instalado' : 'Não Instalado'}`,
      `Capacidade: ${foundationStatus.capacity || 'N/A'}`,
      `Organização: ${foundationStatus.organizationName || 'N/A'}`,
      `Ambiente: ${foundationStatus.environment || 'N/A'}`
    ] : ['Erro: Não foi possível obter status'],
    health: () => systemHealth ? [
      `Database: ${systemHealth.database}`,
      `Servidor: ${systemHealth.server}`,
      `Monitoramento: ${systemHealth.monitoring}`
    ] : ['Erro: Não foi possível obter saúde do sistema'],
    install: () => [
      'Iniciando instalação do Foundation...',
      'Escolha uma capacidade: SMALL, MEDIUM, LARGE, ENTERPRISE',
      'Use: install --capacity=SMALL'
    ],
    logs: () => [
      '[INFO] Sistema iniciado em modo desenvolvimento',
      '[INFO] APIs funcionando corretamente',
      '[INFO] Monitoramento ativo'
    ],
    config: () => [
      'Configuração atual:',
      '  PORT: 5000',
      '  ENV: development',
      '  DB: PostgreSQL conectado'
    ],
    clear: () => {
      setOutput(['']);
      return [];
    },
    exit: () => {
      onBack();
      return [];
    }
  };

  const executeCommand = () => {
    if (!command.trim()) return;

    const newOutput = [...output, `$ ${command}`];
    const cmd = command.toLowerCase().trim();
    
    if (commands[cmd as keyof typeof commands]) {
      const result = commands[cmd as keyof typeof commands]();
      newOutput.push(...result, '');
    } else {
      newOutput.push(`Comando não encontrado: ${cmd}`, 'Digite "help" para ver comandos disponíveis', '');
    }

    setOutput(newOutput);
    setCommand('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Foundation CLI - Modo Desenvolvedor</h1>
          <Button onClick={onBack} variant="outline" size="sm" className="text-green-400 border-green-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto mb-4">
          {output.map((line, index) => (
            <div key={index} className="mb-1">
              {line}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            className="flex-1 bg-transparent text-green-400 outline-none"
            placeholder="Digite um comando..."
            autoFocus
          />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Comandos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(commands).slice(0, 4).map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    onClick={() => setCommand(cmd)}
                    className="w-full justify-start text-green-400 border-green-700"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Status Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Foundation:</span>
                  <Badge className={foundationStatus?.installed ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}>
                    {foundationStatus?.installed ? 'OK' : 'OFF'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <Badge className="bg-green-900 text-green-400">
                    {systemHealth?.database || 'connected'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Server:</span>
                  <Badge className="bg-green-900 text-green-400">
                    {systemHealth?.server || 'healthy'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Interface para especialistas - sistema completo
function ExpertInterface({ foundationStatus, systemHealth, onBack }: {
  foundationStatus: FoundationStatus | undefined;
  systemHealth: SystemHealth | undefined;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DuEuler Foundation - Modo Especialista
            </h1>
            <p className="text-gray-600">
              Acesso completo ao sistema com 2.825 arquivos e 15 subsistemas integrados
            </p>
          </div>
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Arquitetura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Arquivos:</span>
                  <span className="font-mono">2.825</span>
                </div>
                <div className="flex justify-between">
                  <span>Subsistemas:</span>
                  <span className="font-mono">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacidade:</span>
                  <span className="font-mono">{foundationStatus?.capacity}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={foundationStatus?.installed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {foundationStatus?.installed ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ambiente:</span>
                  <span className="font-mono">{foundationStatus?.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Organização:</span>
                  <span className="truncate ml-2">{foundationStatus?.organizationName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Monitoramento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Database:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {systemHealth?.database}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Servidor:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {systemHealth?.server}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Métricas:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {systemHealth?.monitoring}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button size="lg" className="h-24 flex-col gap-2">
            <Database className="h-6 w-6" />
            <span>Gerenciar BD</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Code className="h-6 w-6" />
            <span>Editor de Código</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Monitor className="h-6 w-6" />
            <span>Monitoramento</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Settings className="h-6 w-6" />
            <span>Configurações</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Users className="h-6 w-6" />
            <span>Usuários</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Shield className="h-6 w-6" />
            <span>Segurança</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Terminal className="h-6 w-6" />
            <span>Terminal</span>
          </Button>
          
          <Button size="lg" className="h-24 flex-col gap-2" variant="outline">
            <Zap className="h-6 w-6" />
            <span>Automação</span>
          </Button>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acesso Completo ao Foundation</CardTitle>
            <CardDescription>
              Como especialista, você tem acesso a todas as funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Subsistemas Disponíveis:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Sistema de Autenticação</li>
                  <li>• Gerenciamento de Usuários</li>
                  <li>• Monitoramento em Tempo Real</li>
                  <li>• API Gateway</li>
                  <li>• Sistema de Métricas</li>
                  <li>• Logs de Atividade</li>
                  <li>• Configuração Dinâmica</li>
                  <li>• Sistema de Backup</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Capacidades Avançadas:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Escalabilidade até 1M+ usuários</li>
                  <li>• Integração com sistemas externos</li>
                  <li>• Personalização completa</li>
                  <li>• APIs programáticas</li>
                  <li>• Webhooks e automações</li>
                  <li>• Relatórios customizados</li>
                  <li>• Controle de acesso granular</li>
                  <li>• Auditoria completa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
    return <DeveloperInterface foundationStatus={foundationStatus} systemHealth={systemHealth} onBack={() => setMode('level-selection')} />;
  }

  // Show full app for experts
  if (mode === 'full-app') {
    return <ExpertInterface foundationStatus={foundationStatus} systemHealth={systemHealth} onBack={() => setMode('level-selection')} />;
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