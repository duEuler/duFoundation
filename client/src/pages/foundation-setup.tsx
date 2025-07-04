import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, ChevronLeft, Server, Settings, Users, Database } from 'lucide-react';

interface SystemInfo {
  cpu: string;
  memory: string;
  platform: string;
  nodeVersion: string;
  recommendedCapacity: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
}

export default function FoundationSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [organizationData, setOrganizationData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const steps: Step[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Foundation',
      description: 'Vamos configurar seu sistema empresarial'
    },
    {
      id: 'organization',
      title: 'Dados da Organização',
      description: 'Informações básicas da sua empresa'
    },
    {
      id: 'system-check',
      title: 'Verificação do Sistema',
      description: 'Análise automática da máquina'
    },
    {
      id: 'capacity',
      title: 'Seleção de Capacidade',
      description: 'Escolha baseada nas suas necessidades'
    },
    {
      id: 'install',
      title: 'Instalação',
      description: 'Configurando o Foundation'
    },
    {
      id: 'complete',
      title: 'Concluído',
      description: 'Sistema pronto para uso'
    }
  ];

  // Simulated system detection
  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(() => {
        setSystemInfo({
          cpu: '4 cores (Intel Core i5)',
          memory: '8GB total, 4GB free',
          platform: 'Linux 5.4.0',
          nodeVersion: 'v18.17.0',
          recommendedCapacity: 'small'
        });
      }, 2000);
    }
  }, [currentStep]);

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Setup failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(steps.length - 1);
    },
  });

  const handleInstall = () => {
    setInstalling(true);
    setInstallProgress(0);
    
    // Simulate installation progress
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setupMutation.mutate({
            organizationName: organizationData.name,
            adminEmail: organizationData.email,
            adminPassword: organizationData.password,
            capacity: selectedCapacity,
            wizard: true
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'organization':
        return organizationData.name.trim() !== '' && 
               organizationData.email.trim() !== '' && 
               organizationData.password.trim() !== '';
      case 'system-check':
        return systemInfo !== null;
      case 'capacity':
        return selectedCapacity !== null;
      case 'install':
        return false;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (steps[currentStep].id === 'capacity') {
        setCurrentStep(currentStep + 1);
        handleInstall();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">DuEuler Foundation v3.0</h3>
              <p className="text-gray-600">
                Configuração empresarial com detecção automática de sistema e interface adaptativa por nível de usuário.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">O que será instalado:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sistema de autenticação robusto</li>
                <li>• Interface adaptativa (iniciante/desenvolvedor/expert)</li>
                <li>• Monitoramento em tempo real</li>
                <li>• APIs REST completas</li>
              </ul>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="orgName">Nome da Organização</Label>
              <Input
                id="orgName"
                placeholder="Ex: Minha Empresa Ltda"
                value={organizationData.name}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Email do Administrador</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@minhaempresa.com"
                value={organizationData.email}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="adminPassword">Senha do Administrador</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={organizationData.password}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'system-check':
        return (
          <div className="space-y-6">
            {!systemInfo ? (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Analisando especificações do sistema...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Sistema detectado com sucesso!</span>
                </div>
                
                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">CPU:</span>
                    <span className="text-gray-600">{systemInfo.cpu}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Memória:</span>
                    <span className="text-gray-600">{systemInfo.memory}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Plataforma:</span>
                    <span className="text-gray-600">{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Node.js:</span>
                    <span className="text-gray-600">{systemInfo.nodeVersion}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Capacidade Recomendada:</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    {systemInfo.recommendedCapacity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        );

      case 'capacity':
        const capacities = [
          {
            id: 'nano',
            name: 'Nano',
            description: 'Até 1.000 usuários',
            icon: Users,
            color: 'bg-green-100 text-green-800'
          },
          {
            id: 'small',
            name: 'Small',
            description: '1.000 - 50.000 usuários',
            icon: Server,
            color: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'large',
            name: 'Large',
            description: '50.000 - 1.000.000+ usuários',
            icon: Database,
            color: 'bg-purple-100 text-purple-800'
          }
        ];

        return (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Selecione a capacidade baseada no número esperado de usuários:
            </p>
            
            <div className="grid gap-3">
              {capacities.map((capacity) => {
                const Icon = capacity.icon;
                const isRecommended = capacity.id === systemInfo?.recommendedCapacity;
                const isSelected = selectedCapacity === capacity.id;
                
                return (
                  <div
                    key={capacity.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCapacity(capacity.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{capacity.name}</h4>
                            {isRecommended && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Recomendado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{capacity.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'install':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Instalando Foundation</h3>
              <p className="text-gray-600">
                Configurando seu sistema empresarial...
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={installProgress} className="w-full" />
              <p className="text-sm text-gray-500">{installProgress}% concluído</p>
            </div>
            {setupMutation.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">
                  Erro na instalação. Tente novamente.
                </p>
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Installation Complete!</h3>
              <p className="text-gray-600">
                Foundation foi instalado com sucesso. Seu sistema está pronto para uso.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Próximos passos:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Acesse o sistema com suas credenciais</li>
                <li>• Explore a interface adaptativa</li>
                <li>• Configure usuários adicionais</li>
              </ul>
            </div>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Ir para o Sistema
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Setup do Foundation
          </CardTitle>
          <CardDescription className="text-gray-600">
            {steps[currentStep].description}
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Passo {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          {/* Navigation buttons */}
          {steps[currentStep].id !== 'install' && steps[currentStep].id !== 'complete' && (
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === steps.length - 3 ? 'Instalar' : 'Próximo'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}