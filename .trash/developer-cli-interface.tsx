// Interface CLI que foi criada - preservada para referência futura
// Pode ser útil para integração posterior no foundation/_app/

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Monitor, ArrowLeft } from "lucide-react";

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

export default DeveloperInterface;