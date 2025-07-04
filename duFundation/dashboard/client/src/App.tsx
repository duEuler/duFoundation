import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "../components/ui/toaster";
import { TooltipProvider } from "../components/ui/tooltip";
import { AuthProvider, useAuth } from "../hooks/use-auth";
import { SetupWizard } from "../components/SetupWizard";
import SetupPage from "../pages/setup";
import LoginPage from "../pages/login";
import DashboardPage from "../pages/dashboard";
import DependenciesPage from "../pages/dependencies";
import CapacitiesPage from "../pages/capacities";
import NotFound from "../pages/not-found";

type AppMode = 'onboarding' | 'login' | 'app';

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
  const { user } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('onboarding');
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Verificar se o sistema já foi configurado
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const data = await response.json();
        if (data.setupComplete) {
          setIsSetupComplete(true);
          setAppMode(user ? 'app' : 'login');
        } else {
          setIsSetupComplete(false);
          setAppMode('onboarding');
        }
      } else {
        setIsSetupComplete(false);
        setAppMode('onboarding');
      }
    } catch (error) {
      setIsSetupComplete(false);
      setAppMode('onboarding');
    }
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
    setAppMode('login');
  };

  // Renderização baseada no modo atual
  switch (appMode) {
    case 'onboarding':
      return (
        <SetupWizard 
          onComplete={handleSetupComplete}
        />
      );
      
    case 'login':
      if (user) {
        setAppMode('app');
        return null; // Vai rerender para 'app'
      }
      return <LoginPage />;
      
    case 'app':
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
