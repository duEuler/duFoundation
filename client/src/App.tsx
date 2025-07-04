import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Página inicial que detecta Foundation e redireciona automaticamente
function WelcomePage() {
  const [loading, setLoading] = useState(true);
  const [foundationStatus, setFoundationStatus] = useState(null);

  useEffect(() => {
    // Detectar status do Foundation
    fetch('/api/foundation/status')
      .then(res => res.json())
      .then(data => {
        setFoundationStatus(data);
        setLoading(false);
        
        // Redirecionar automaticamente se Foundation estiver instalado
        if (data.installed) {
          window.location.href = '/foundation/dashboard';
        }
      })
      .catch(error => {
        console.log('Foundation não detectado, mostrando página de boas-vindas');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sistema...</p>
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
          {foundationStatus?.installed ? (
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-4">
                Foundation Ativo
              </h2>
              <p className="text-gray-600 mb-6">
                Redirecionando para o dashboard...
              </p>
              <a 
                href="/foundation/dashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Acessar Dashboard
              </a>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Foundation Não Configurado
              </h2>
              <p className="text-gray-600 mb-6">
                Configure o Foundation para começar a usar o sistema:
              </p>
              <a 
                href="/foundation/setup"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Configurar Foundation
              </a>
            </div>
          )}
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