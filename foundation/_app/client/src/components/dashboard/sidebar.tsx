import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useIsMobile } from "../hooks/use-mobile";
import { Button } from "../components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  UsersRound, 
  FolderKanban,
  Home,
  User,
  Bell,
  HelpCircle,
  LogOut,
  TrendingUp,
  Package,
  Monitor,
  Database,
  Layers,
  Menu,
  X
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/foundation/" },
    { icon: Users, label: "Gestão de Usuários", href: "/users" },
    { icon: Shield, label: "Permissões", href: "/permissions" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  const foundationMenuItems = [
    { icon: Package, label: "Dependências & Bibliotecas", href: "/foundation/dependencies" },
    { icon: Monitor, label: "Monitoramento Avançado", href: "/foundation/monitoring" },
  ];

  const managerMenuItems = [
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
    { icon: UsersRound, label: "Equipe", href: "/team" },
    { icon: FolderKanban, label: "Projetos", href: "/projects" },
  ];

  const generalMenuItems = [
    { icon: Home, label: "Início", href: "/foundation/" },
    { icon: User, label: "Perfil", href: "/profile" },
    { icon: Bell, label: "Notificações", href: "/notifications" },
    { icon: HelpCircle, label: "Ajuda", href: "/help" },
  ];

  const shouldShowAdminMenu = user?.role === "admin";
  const shouldShowManagerMenu = user?.role === "admin" || user?.role === "manager";

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md hover:bg-gray-100"
        >
          <Menu size={20} />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isMobile ? 'md:translate-x-0' : ''}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 dueuler-bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">DuEuler</h2>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      <nav className="mt-6">
        {shouldShowAdminMenu && (
          <div>
            <div className="px-6 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Administração
              </h3>
            </div>
            <ul className="space-y-1 px-3">
              {adminMenuItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="nav-item">
                    <item.icon size={20} className="mr-3" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}



        {shouldShowManagerMenu && (
          <div className="mt-6">
            <div className="px-6 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Gerência
              </h3>
            </div>
            <ul className="space-y-1 px-3">
              {managerMenuItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="nav-item">
                    <item.icon size={20} className="mr-3" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {shouldShowAdminMenu && (
          <div className="mt-6">
            <div className="px-6 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Foundation Analytics
              </h3>
            </div>
            <ul className="space-y-1 px-3">
              <li>
                <a href="/foundation/dependencies" className="nav-item">
                  <Database size={20} className="mr-3" />
                  Dependências & Bibliotecas
                </a>
              </li>
              <li>
                <a href="/foundation/capacities" className="nav-item">
                  <Layers size={20} className="mr-3" />
                  Capacidades Foundation
                </a>
              </li>
            </ul>
          </div>
        )}

        <div className="mt-6">
          <div className="px-6 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Geral
            </h3>
          </div>
          <ul className="space-y-1 px-3">
            {generalMenuItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="nav-item">
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={20} className="mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
}
