import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import SetupPage from "@/pages/setup";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import DependenciesPage from "@/pages/foundation/dependencies";
import CapacitiesPage from "@/pages/foundation/capacities";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/setup" component={SetupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/foundation/dependencies" component={DependenciesPage} />
      <Route path="/foundation/capacities" component={CapacitiesPage} />
      <Route path="/" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
