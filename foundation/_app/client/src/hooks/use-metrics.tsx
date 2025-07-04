import { useQuery } from "@tanstack/react-query";

interface Metric {
  label: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down";
}

interface SystemStatus {
  service: string;
  status: "online" | "degraded" | "offline";
  icon: string;
}

interface Activity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
}

export function useMetrics() {
  const metricsQuery = useQuery<Metric[]>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const systemStatusQuery = useQuery<SystemStatus[]>({
    queryKey: ["/api/system/status"],
    refetchInterval: 60000, // Refresh every minute
  });

  const activityQuery = useQuery<Activity[]>({
    queryKey: ["/api/activity"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    metrics: metricsQuery.data || [],
    systemStatus: systemStatusQuery.data || [],
    recentActivity: activityQuery.data || [],
    isLoading: metricsQuery.isLoading || systemStatusQuery.isLoading || activityQuery.isLoading,
    error: metricsQuery.error || systemStatusQuery.error || activityQuery.error,
  };
}
