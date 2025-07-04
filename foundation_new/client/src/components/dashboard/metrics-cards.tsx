import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Database, Clock } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down";
}

export function MetricsCards() {
  const { data: metrics = [], isLoading } = useQuery<Metric[]>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return Users;
      case "chart-line":
        return TrendingUp;
      case "memory":
        return Database;
      case "clock":
        return Clock;
      default:
        return TrendingUp;
    }
  };

  const getIconBgColor = (iconName: string) => {
    switch (iconName) {
      case "users":
        return "bg-blue-100 text-blue-600";
      case "chart-line":
        return "bg-green-100 text-green-600";
      case "memory":
        return "bg-yellow-100 text-yellow-600";
      case "clock":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="metric-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-12 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = getIcon(metric.icon);
        const iconClasses = getIconBgColor(metric.icon);
        
        return (
          <Card key={index} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconClasses}`}>
                  <IconComponent size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  metric.trend === "up" ? "dueuler-success" : "dueuler-error"
                }`}>
                  {metric.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs último mês</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
