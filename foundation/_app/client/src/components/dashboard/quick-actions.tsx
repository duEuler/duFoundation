import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Download, Settings } from "lucide-react";

export function QuickActions() {
  const { user } = useAuth();

  return (
    <Card className="metric-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {user?.role === "admin" && (
            <Button className="w-full dueuler-bg-primary hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Criar Usuário
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} className="mr-2" />
            Exportar Dados
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Settings size={16} className="mr-2" />
            Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
