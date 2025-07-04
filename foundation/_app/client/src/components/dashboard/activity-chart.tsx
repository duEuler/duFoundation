import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BarChart3 } from "lucide-react";

export function ActivityChart() {
  return (
    <Card className="metric-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Atividade do Sistema
          </CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-500">Gráfico de atividade em tempo real</p>
            <p className="text-xs text-gray-400 mt-1">
              Integração com biblioteca de gráficos em desenvolvimento
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
