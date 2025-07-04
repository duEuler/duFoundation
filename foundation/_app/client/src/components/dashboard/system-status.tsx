import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface SystemStatus {
  service: string;
  status: "online" | "degraded" | "offline";
  icon: string;
}

export function SystemStatus() {
  const { data: statuses = [], isLoading } = useQuery<SystemStatus[]>({
    queryKey: ["/api/system/status"],
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "degraded":
        return "Degradado";
      case "offline":
        return "Offline";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="metric-card">
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="metric-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{status.service}</span>
              <Badge className={getStatusColor(status.status)}>
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {getStatusLabel(status.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
