import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { UserLevelSelector } from "@/components/UserLevelSelector";
import { SimpleInterface } from "@/components/SimpleInterface";
import { SetupWizard } from "@/components/SetupWizard";
import SetupPage from "@/pages/setup";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import DependenciesPage from "@/pages/dependencies";
import CapacitiesPage from "@/pages/capacities";
import NotFound from "@/pages/not-found";

type UserLevel = 'beginner' | 'developer' | 'expert' | null;
type AppMode = 'level-selection' | 'setup-wizard' | 'simple-interface' | 'full-app';

function Router() {
  return (
    <Switch>
      <Route path="/foundation/setup" component={SetupPage} />
      <Route path="/foundation/login" component={LoginPage} />
      <Route path="/foundation/" component={DashboardPage} />
      <Route path="/foundation/dependencies" component={DependenciesPage} />
      <Route path="/foundation/capacities" component={CapacitiesPage} />
      <Route path="/foundation/" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [userLevel, setUserLevel] = useState<UserLevel>(null);
  const [appMode, setAppMode] = useState<AppMode>('level-selection');
  const [foundationInstalled, setFoundationInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se Foundation está instalado
    checkFoundationStatus();
    
    // Verificar se usuário já escolheu um nível
    const savedLevel = localStorage.getItem('foundation-user-level');
    if (savedLevel) {
      setUserLevel(savedLevel as UserLevel);
      setAppMode(savedLevel === 'beginner' ? 'simple-interface' : 'full-app');
    }
  }, []);

  const checkFoundationStatus = async () => {
    try {
      const response = await fetch('/api/foundation/status');
      const data = await response.json();
      setFoundationInstalled(data.installed);
    } catch (error) {
      setFoundationInstalled(false);
    }
  };

  const handleLevelSelect = (level: UserLevel) => {
    setUserLevel(level);
    localStorage.setItem('foundation-user-level', level || '');
    
    if (level === 'beginner') {
      if (foundationInstalled) {
        setAppMode('simple-interface');
      } else {
        setAppMode('setup-wizard');
      }
    } else {
      setAppMode('full-app');
    }
  };

  const handleModeChange = (mode: 'developer' | 'expert') => {
    setUserLevel(mode);
    localStorage.setItem('foundation-user-level', mode);
    setAppMode('full-app');
  };

  const handleSetupComplete = () => {
    setFoundationInstalled(true);
    setAppMode('simple-interface');
  };

  const handleSetupCancel = () => {
    setAppMode('level-selection');
    setUserLevel(null);
    localStorage.removeItem('foundation-user-level');
  };

  // Renderização baseada no modo atual
  switch (appMode) {
    case 'level-selection':
      return <UserLevelSelector onLevelSelect={handleLevelSelect} />;
      
    case 'setup-wizard':
      return (
        <SetupWizard 
          onComplete={handleSetupComplete}
          onCancel={handleSetupCancel}
        />
      );
      
    case 'simple-interface':
      return <SimpleInterface onModeChange={handleModeChange} />;
      
    case 'full-app':
    default:
      return <Router />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
