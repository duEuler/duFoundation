import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  Database, 
  Shield, 
  Monitor, 
  Package, 
  GitBranch,
  Settings,
  AlertTriangle,
  BarChart3,
  FileText,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Layers
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard Principal",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Usuários",
    icon: Users,
    href: "/users",
  },
  {
    title: "Monitoramento",
    items: [
      {
        title: "Visão Geral",
        icon: Monitor,
        href: "/monitoring/overview",
      },
      {
        title: "Recursos de Sistema",
        icon: Server,
        href: "/monitoring/resources",
      },
      {
        title: "Métricas em Tempo Real",
        icon: Activity,
        href: "/monitoring/metrics",
      },
      {
        title: "Logs e Alertas",
        icon: AlertTriangle,
        href: "/monitoring/logs",
      },
    ]
  },
  {
    title: "Foundation Analytics",
    items: [
      {
        title: "Capacidades Foundation",
        icon: Layers,
        href: "/foundation/capacities",
      },
      {
        title: "Dependências & Bibliotecas",
        icon: Package,
        href: "/foundation/dependencies",
      },
      {
        title: "Infraestrutura",
        icon: Cpu,
        href: "/foundation/infrastructure",
      },
      {
        title: "Segurança & Compliance",
        icon: Shield,
        href: "/foundation/security",
      },
      {
        title: "Performance & Otimização",
        icon: BarChart3,
        href: "/foundation/performance",
      },
    ]
  },
  {
    title: "Recursos Técnicos",
    items: [
      {
        title: "Banco de Dados",
        icon: Database,
        href: "/resources/database",
      },
      {
        title: "Rede & Conectividade",
        icon: Network,
        href: "/resources/network",
      },
      {
        title: "Armazenamento",
        icon: HardDrive,
        href: "/resources/storage",
      },
      {
        title: "APIs & Integrações",
        icon: GitBranch,
        href: "/resources/apis",
      },
    ]
  },
  {
    title: "Relatórios",
    items: [
      {
        title: "Compatibilidade",
        icon: FileText,
        href: "/reports/compatibility",
      },
      {
        title: "Análise de Consumo",
        icon: BarChart3,
        href: "/reports/consumption",
      },
      {
        title: "Logs de Sistema",
        icon: FileText,
        href: "/reports/system-logs",
      },
    ]
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/settings",
  },
];

export function SidebarNavigation({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            duEuler Foundation
          </h2>
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              {navigationItems.map((item, index) => {
                if (item.items) {
                  return (
                    <div key={index} className="px-3 py-2">
                      <h3 className="mb-2 px-4 text-sm font-medium text-muted-foreground">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <Button
                              variant={location === subItem.href ? "secondary" : "ghost"}
                              className="w-full justify-start"
                            >
                              <subItem.icon className="mr-2 h-4 w-4" />
                              {subItem.title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={index} href={item.href!}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}