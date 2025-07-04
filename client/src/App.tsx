import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Bem-vindo ao DuEuler Foundation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sistema de gerenciamento empresarial avançado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Sistema Empresarial</h2>
            <p className="text-muted-foreground mb-4">
              Plataforma completa para gestão empresarial com recursos avançados de monitoramento e automação.
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Gerenciamento de usuários e permissões</li>
              <li>• Monitoramento em tempo real</li>
              <li>• Relatórios e análises</li>
              <li>• Configurações personalizáveis</li>
            </ul>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Tecnologias</h2>
            <p className="text-muted-foreground mb-4">
              Construído com as mais modernas tecnologias web para performance e escalabilidade.
            </p>
            <ul className="space-y-2 text-sm">
              <li>• React + TypeScript</li>
              <li>• Node.js + Express</li>
              <li>• PostgreSQL + Drizzle ORM</li>
              <li>• Tailwind CSS + shadcn/ui</li>
            </ul>
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