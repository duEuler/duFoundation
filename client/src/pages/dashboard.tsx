import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { UserTable } from "@/components/dashboard/user-table";
import { SystemStatus } from "@/components/dashboard/system-status";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FoundationMetrics } from "@/components/dashboard/foundation-metrics";
import { FoundationConfig } from "@/components/dashboard/foundation-config";
import { ResourceStatus } from "@/components/dashboard/resource-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CapacitiesPage from "@/pages/foundation/capacities";
import DependenciesPage from "@/pages/foundation/dependencies";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen dueuler-gradient flex items-center justify-center">
        <div className="text-white text-center">
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <Header />
        
        <main className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Dashboard Principal</TabsTrigger>
              <TabsTrigger value="capacities">Capacidades Foundation</TabsTrigger>
              <TabsTrigger value="dependencies">Dependências & Bibliotecas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <ResourceStatus />
              <MetricsCards />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 space-y-6">
                  <ActivityChart />
                  {user.role === "admin" && <UserTable />}
                </div>
                
                <div className="space-y-6">
                  <FoundationMetrics />
                  {user.role === "admin" && <FoundationConfig />}
                  <SystemStatus />
                  <RecentActivity />
                  <QuickActions />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="capacities">
              <CapacitiesPage />
            </TabsContent>
            
            <TabsContent value="dependencies">
              <DependenciesPage />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
