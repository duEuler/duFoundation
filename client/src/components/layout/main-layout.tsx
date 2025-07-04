import { ReactNode } from "react";
import { SidebarNavigation } from "./sidebar-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showTotals?: boolean;
  totals?: {
    activeUsers?: number;
    totalCapacities?: number;
    activeAlerts?: number;
    systemHealth?: "healthy" | "degraded" | "critical";
  };
  alerts?: Array<{
    type: "warning" | "error" | "info";
    message: string;
    count?: number;
  }>;
}

export function MainLayout({ 
  children, 
  title, 
  showTotals = true, 
  totals = {
    activeUsers: 0,
    totalCapacities: 6,
    activeAlerts: 0,
    systemHealth: "healthy"
  },
  alerts = []
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <SidebarNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Totals */}
        {showTotals && (
          <div className="border-b bg-background p-4 space-y-4">
            {title && (
              <h1 className="text-2xl font-bold">{title}</h1>
            )}
            
            {/* Totalizadores */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Sessões ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Capacidades Foundation</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.totalCapacities}</div>
                  <p className="text-xs text-muted-foreground">
                    NANO → ENTERPRISE
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.activeAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    Requer atenção
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        totals.systemHealth === "healthy" ? "default" :
                        totals.systemHealth === "degraded" ? "secondary" : "destructive"
                      }
                    >
                      {totals.systemHealth === "healthy" ? "Saudável" :
                       totals.systemHealth === "degraded" ? "Degradado" : "Crítico"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Último check: agora
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Atenção */}
            {alerts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Lista de Atenção</h3>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.type === "error" ? "text-red-500" :
                          alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                        }`} />
                        <span className="text-sm">{alert.message}</span>
                      </div>
                      {alert.count && (
                        <Badge variant="outline">{alert.count}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}