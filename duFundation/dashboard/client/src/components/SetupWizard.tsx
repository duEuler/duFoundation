import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Monitor, Cpu, HardDrive } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

interface SystemInfo {
  cpu: string;
  memory: string;
  platform: string;
  nodeVersion: string;
  recommendedCapacity: string;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installError, setInstallError] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [organizationData, setOrganizationData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const capacityOptions = [
    {
      id: 'nano',
      name: 'Projeto Pequeno',
      description: 'Até 100 usuários - Ideal para testes e desenvolvimento',
      specs: '512MB RAM, 1 CPU core',
      icon: '🌱',
      recommended: false
    },
    {
      id: 'small',
      name: 'Projeto Médio',
      description: '1.000 - 10.000 usuários - Recomendado para a maioria',
      specs: '2GB RAM, 2 CPU cores',
      icon: '🏢',
      recommended: true
    },
    {
      id: 'large',
      name: 'Projeto Grande',
      description: '10.000+ usuários - Para aplicações empresariais',
      specs: '4GB RAM, 4 CPU cores',
      icon: '🏭',
      recommended: false
    }
  ];

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Foundation',
      description: 'Vamos configurar o Foundation para seu projeto'
    },
    {
      id: 'organization',
      title: 'Dados da Organização',
      description: 'Informe os dados básicos da sua empresa ou projeto'
    },
    {
      id: 'system-check',
      title: 'Verificação do Sistema',
      description: 'Analisando sua máquina para recomendação ideal'
    },
    {
      id: 'capacity',
      title: 'Escolha o Tamanho',
      description: 'Selecione a capacidade adequada para seu projeto'
    },
    {
      id: 'confirm',
      title: 'Confirmar Instalação',
      description: 'Revise suas escolhas antes da instalação'
    },
    {
      id: 'install',
      title: 'Instalando...',
      description: 'Aguarde enquanto configuramos tudo para você'
    },
    {
      id: 'complete',
      title: 'Instalação Concluída!',
      description: 'Foundation está pronto para uso'
    }
  ];

  useEffect(() => {
    // Carregar informações do sistema automaticamente
    if (steps[currentStep].id === 'system-check') {
      detectSystemInfo();
    }
  }, [currentStep]);

  const detectSystemInfo = async () => {
    try {
      const response = await fetch('/api/system/detect');
      const data = await response.json();
      setSystemInfo(data);
      
      // Auto-selecionar capacidade baseada na recomendação
      setSelectedCapacity(data.recommendedCapacity);
    } catch (error) {
      console.error('Erro ao detectar sistema:', error);
      // Fallback para dados básicos
      setSystemInfo({
        cpu: 'Detectando...',
        memory: 'Detectando...',
        platform: 'Detectando...',
        nodeVersion: 'Detectando...',
        recommendedCapacity: 'small'
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startInstallation = async () => {
    setIsInstalling(true);
    setInstallError(null);
    nextStep(); // Vai para step "install"

    try {
      const installSteps = [
        { message: 'Verificando compatibilidade...', progress: 15 },
        { message: 'Preparando estrutura...', progress: 30 },
        { message: 'Configurando banco de dados...', progress: 50 },
        { message: 'Instalando dependências...', progress: 70 },
        { message: 'Configurando monitoramento...', progress: 85 },
        { message: 'Finalizando configuração...', progress: 100 }
      ];

      for (const step of installSteps) {
        setInstallProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Simular chamada real para API
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: organizationData.name,
          adminEmail: organizationData.email,
          adminPassword: organizationData.password,
          capacity: selectedCapacity,
          environment: 'production',
          wizard: true
        })
      });

      if (!response.ok) {
        throw new Error('Falha na instalação');
      }

      nextStep(); // Vai para step "complete"
      setTimeout(() => {
        onComplete();
      }, 3000);

    } catch (error) {
      setInstallError('Houve um erro durante a instalação. Tente novamente.');
      setIsInstalling(false);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🚀</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Foundation v3.0</h2>
              <p className="text-gray-600 mb-6">
                O sistema de gestão empresarial mais avançado para seu projeto.
                Vamos configurar tudo em poucos passos simples.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">O que você vai ter:</h3>
              <ul className="text-sm text-left space-y-1">
                <li>✅ Sistema completo instalado automaticamente</li>
                <li>✅ Banco de dados configurado</li>
                <li>✅ Monitoramento em tempo real</li>
                <li>✅ Interface de gestão amigável</li>
              </ul>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Dados da Organização</h2>
              <p className="text-gray-600">
                Informe os dados básicos para criar o primeiro usuário administrativo
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Nome da Organização/Projeto</Label>
                <Input
                  id="orgName"
                  value={organizationData.name}
                  onChange={(e) => setOrganizationData({...organizationData, name: e.target.value})}
                  placeholder="Ex: Minha Empresa Ltda"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={organizationData.email}
                  onChange={(e) => setOrganizationData({...organizationData, email: e.target.value})}
                  placeholder="admin@empresa.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="adminPassword">Senha do Administrador</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={organizationData.password}
                  onChange={(e) => setOrganizationData({...organizationData, password: e.target.value})}
                  placeholder="Escolha uma senha segura"
                  className="mt-1"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Estes dados serão usados para criar o primeiro usuário administrativo do sistema.
                Você poderá adicionar mais usuários depois da instalação.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'system-check':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-xl font-bold mb-2">Analisando seu Sistema</h2>
              <p className="text-gray-600">
                Detectando automaticamente as configurações ideais para seu ambiente
              </p>
            </div>
            
            {systemInfo ? (
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Processador</p>
                        <p className="text-xs text-gray-600">{systemInfo.cpu}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Memória</p>
                        <p className="text-xs text-gray-600">{systemInfo.memory}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Plataforma</p>
                        <p className="text-xs text-gray-600">{systemInfo.platform}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Circle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Node.js</p>
                        <p className="text-xs text-gray-600">{systemInfo.nodeVersion}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">💡 Recomendação Automática</h3>
                  <p className="text-sm text-green-700">
                    Baseado na análise do seu sistema, recomendamos a configuração <strong>
                    {capacityOptions.find(opt => opt.id === systemInfo.recommendedCapacity)?.name}</strong>.
                    Você pode ajustar na próxima etapa se necessário.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Progress value={75} className="w-full" />
                <p className="text-sm text-gray-600">Analisando sistema...</p>
              </div>
            )}
          </div>
        );

      case 'capacity':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Qual o tamanho do seu projeto?</h2>
              <p className="text-gray-600">
                Escolha a configuração que melhor se adapta às suas necessidades
              </p>
            </div>
            
            <div className="space-y-4">
              {capacityOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedCapacity === option.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedCapacity(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{option.name}</h3>
                          {option.recommended && (
                            <Badge className="bg-green-100 text-green-800">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className="text-xs text-gray-500">{option.specs}</p>
                      </div>
                      <div>
                        {selectedCapacity === option.id ? (
                          <CheckCircle className="text-blue-500 w-6 h-6" />
                        ) : (
                          <Circle className="text-gray-300 w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'confirm':
        const selectedOption = capacityOptions.find(opt => opt.id === selectedCapacity);
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Confirme a Instalação</h2>
              <p className="text-gray-600">
                Revise suas configurações antes de prosseguir
              </p>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Configuração Selecionada:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tipo de Projeto:</span>
                    <span className="font-medium">{selectedOption?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacidade:</span>
                    <span className="font-medium">{selectedOption?.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recursos:</span>
                    <span className="font-medium">{selectedOption?.specs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription>
                A instalação levará aproximadamente 2-3 minutos. 
                Durante este tempo, o Foundation será configurado automaticamente.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'install':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">⚙️</div>
            <div>
              <h2 className="text-xl font-bold mb-2">Instalando Foundation...</h2>
              <p className="text-gray-600 mb-6">
                Aguarde enquanto configuramos tudo para você
              </p>
            </div>
            
            <div className="space-y-4">
              <Progress value={installProgress} className="w-full" />
              <p className="text-sm text-gray-600">
                {installProgress}% concluído
              </p>
            </div>

            {installError && (
              <Alert className="mt-4">
                <AlertDescription className="text-red-600">
                  {installError}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p>
                🔄 Não feche esta janela durante a instalação
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Foundation Instalado com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu sistema está configurado e pronto para uso
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">Próximos passos:</h3>
              <ul className="text-sm text-left space-y-1 text-green-700">
                <li>✅ Explore o dashboard principal</li>
                <li>✅ Configure suas preferências</li>
                <li>✅ Comece a usar as funcionalidades</li>
                <li>✅ Consulte a documentação se precisar de ajuda</li>
              </ul>
            </div>

            <p className="text-sm text-gray-500">
              Redirecionando para o dashboard em alguns segundos...
            </p>
          </div>
        );

      default:
        return null;
    }
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
        return false; // Não pode pular durante instalação
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-lg font-semibold">{steps[currentStep].title}</h1>
          <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <div>
          {currentStep > 0 && !isInstalling && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentStep === 0 && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          
          {steps[currentStep].id === 'confirm' && (
            <Button onClick={startInstallation} disabled={!canProceed()}>
              🚀 Instalar Foundation
            </Button>
          )}
          
          {steps[currentStep].id !== 'confirm' && 
           steps[currentStep].id !== 'install' && 
           steps[currentStep].id !== 'complete' && (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}