import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Verifica se o Foundation está instalado
function useFoundationStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.foundation-installed')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setIsInstalled(!!data?.installed);
        setLoading(false);
      })
      .catch(() => {
        setIsInstalled(false);
        setLoading(false);
      });
  }, []);

  return { isInstalled, loading };
}

function WelcomePage() {
  const { isInstalled, loading } = useFoundationStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl mr-4">🌟</span>
            <h1 className="text-4xl font-bold text-blue-600">
              DuEuler Foundation v3.0
            </h1>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center">
              <span className="text-green-600 mr-2">✅</span>
              <p className="text-green-800 font-medium">Foundation instalado e funcionando perfeitamente!</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🚀 Sistema de Padronização Progressiva</h3>
              <p className="text-gray-600 text-sm">Foundation v3.0 implementa arquitetura híbrida que combina padronização rígida para projetos novos com migração assistida para projetos existentes.</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔍 Verificação Preventiva Obrigatória</h3>
              <p className="text-gray-600 text-sm">Sistema bloqueia instalações incompatíveis automaticamente, detectando problemas antes que ocorram.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ Templates Dinâmicos</h3>
              <p className="text-gray-600 text-sm">Geração automática de código ES modules ou CommonJS baseado no projeto alvo.</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Comandos Disponíveis:</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="font-mono text-sm text-gray-700">foundation-scanner</div>
              </div>
            </div>

            <div className="pt-6">
              <a 
                href="/foundation/setup" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <span className="mr-2">⚙️</span>
                Acessar Foundation Setup
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          DuEuler Foundation Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema empresarial de colaboração avançada
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sistema em Estado Virgem
          </h2>
          <p className="text-gray-600 mb-6">
            Para ativar o Foundation, execute o comando de instalação no terminal:
          </p>
          <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
            node foundation/foundation-detector.cjs
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
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