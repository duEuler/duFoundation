import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import SetupPage from "@/pages/setup";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import DependenciesPage from "@/pages/dependencies";
import CapacitiesPage from "@/pages/capacities";
import NotFound from "@/pages/not-found";

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
