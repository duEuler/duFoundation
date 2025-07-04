import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';

interface SimpleInterfaceProps {
  onModeChange: (mode: 'developer' | 'expert') => void;
}

export function SimpleInterface({ onModeChange }: SimpleInterfaceProps) {
  const [foundationStatus, setFoundationStatus] = useState<'checking' | 'installed' | 'not-installed' | 'error'>('checking');
  const [installProgress, setInstallProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: 'unknown',
    server: 'unknown',
    monitoring: 'unknown'
  });

  useEffect(() => {
    checkFoundationStatus();
    checkSystemHealth();
  }, []);

  const checkFoundationStatus = async () => {
    try {
      const response = await fetch('/api/foundation/status');
      const data = await response.json();
      setFoundationStatus(data.installed ? 'installed' : 'not-installed');
    } catch (error) {
      setFoundationStatus('error');
    }
  };

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/system/health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      setSystemHealth({
        database: 'error',
        server: 'error', 
        monitoring: 'error'
      });
    }
  };

  const installFoundation = async () => {
    setIsInstalling(true);
    setInstallProgress(0);

    try {
      // Simular progresso de instalação
      const progressSteps = [
        { step: 'Verificando compatibilidade...', progress: 20 },
        { step: 'Preparando arquivos...', progress: 40 },
        { step: 'Configurando banco de dados...', progress: 60 },
        { step: 'Instalando dependências...', progress: 80 },
        { step: 'Finalizando...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        setInstallProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await fetch('/api/foundation/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: 'small', quickSetup: true })
      });

      if (response.ok) {
        setFoundationStatus('installed');
        checkSystemHealth();
      } else {
        throw new Error('Falha na instalação');
      }
    } catch (error) {
      setFoundationStatus('error');
    } finally {
      setIsInstalling(false);
      setInstallProgress(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'disconnected':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '✅ Funcionando';
      case 'connected': return '✅ Conectado';
      case 'active': return '✅ Ativo';
      case 'warning': return '⚠️ Atenção';
      case 'error': return '❌ Erro';
      case 'disconnected': return '❌ Desconectado';
      case 'inactive': return '💤 Inativo';
      default: return '🔍 Verificando...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Foundation Manager</h1>
        <p className="text-gray-600">Interface simples para gerenciar seu Foundation</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onModeChange('developer')}>
            Modo Desenvolvedor
          </Button>
          <Button variant="outline" size="sm" onClick={() => onModeChange('expert')}>
            Modo Especialista
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Foundation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Foundation
              <Badge className={getStatusColor(foundationStatus)}>
                {foundationStatus === 'installed' ? 'Instalado' : 
                 foundationStatus === 'not-installed' ? 'Não Instalado' :
                 foundationStatus === 'error' ? 'Erro' : 'Verificando...'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Sistema principal de gerenciamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foundationStatus === 'not-installed' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  O Foundation não está instalado no seu projeto.
                </p>
                {!isInstalling ? (
                  <Button onClick={installFoundation} className="w-full">
                    🚀 Instalar Foundation
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Progress value={installProgress} className="w-full" />
                    <p className="text-sm text-center">Instalando... {installProgress}%</p>
                  </div>
                )}
              </div>
            )}
            
            {foundationStatus === 'installed' && (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">
                  ✅ Foundation instalado e funcionando
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalhes
                </Button>
              </div>
            )}

            {foundationStatus === 'error' && (
              <Alert>
                <AlertDescription>
                  Houve um problema. Clique em "Resolver Problemas" para ajuda.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Status do Sistema</CardTitle>
            <CardDescription>
              Monitoramento em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base de Dados</span>
                <Badge className={getStatusColor(systemHealth.database)}>
                  {getStatusText(systemHealth.database)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Servidor</span>
                <Badge className={getStatusColor(systemHealth.server)}>
                  {getStatusText(systemHealth.server)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monitoramento</span>
                <Badge className={getStatusColor(systemHealth.monitoring)}>
                  {getStatusText(systemHealth.monitoring)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="text-2xl mb-2">⚙️</div>
            <CardTitle className="text-lg">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Ajustar configurações básicas
            </p>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="text-2xl mb-2">🔧</div>
            <CardTitle className="text-lg">Resolver Problemas</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Diagnóstico e correção automática
            </p>
            <Button variant="outline" size="sm">
              Diagnosticar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-2">
            <div className="text-2xl mb-2">📚</div>
            <CardTitle className="text-lg">Ajuda</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Guias e documentação
            </p>
            <Button variant="outline" size="sm">
              Ver Guias
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {foundationStatus === 'installed' && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Ações Rápidas</CardTitle>
            <CardDescription>
              Tarefas comuns em um clique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                📊 Ver Métricas
              </Button>
              <Button variant="outline" className="justify-start">
                🔄 Atualizar Sistema
              </Button>
              <Button variant="outline" className="justify-start">
                💾 Fazer Backup
              </Button>
              <Button variant="outline" className="justify-start">
                📖 Ver Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Foundation v3.0 - Sistema de Gestão Empresarial</p>
        <p>Dúvidas? Clique em "Ajuda" ou mude para o Modo Desenvolvedor</p>
      </div>
    </div>
  );
}