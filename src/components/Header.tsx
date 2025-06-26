
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, MessageSquare, Settings, QrCode, LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: systemSettings = [] } = useSystemSettings();
  
  const logoSetting = systemSettings.find((s: any) => s.key === 'logo');
  const logoUrl = logoSetting ? 
    (typeof logoSetting.value === 'string' ? 
      logoSetting.value : 
      JSON.parse(String(logoSetting.value))
    ) : '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
    },
    {
      title: 'Leads',
      icon: Users,
      path: '/leads',
    },
    {
      title: 'Mensagens',
      icon: MessageSquare,
      path: '/messages',
    },
    {
      title: 'QR Code',
      icon: QrCode,
      path: '/qr-code',
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 h-14 md:h-16 border-b bg-white shadow-sm px-3 md:px-6 flex items-center justify-between">
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center">
          <img
            src={logoUrl}
            alt="CESMAC"
            className="h-8 w-auto object-contain"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col space-y-4 mt-6">
              <div className="text-sm text-gray-600 pb-4 border-b">
                Olá, <strong className="text-blue-700">{user?.username}</strong>
              </div>
              
              <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'justify-start w-full',
                        isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span>{item.title}</span>
                    </Button>
                  );
                })}
              </nav>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-300 mt-4"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sair</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center space-x-6 w-full">
        <div className="flex items-center">
          <img
            src={logoUrl}
            alt="CESMAC"
            className="h-10 w-auto object-contain"
          />
        </div>
        
        <nav className="flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'flex items-center space-x-2 h-10 text-gray-700 hover:text-blue-600',
                  isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            );
          })}
        </nav>
        
        <div className="flex items-center space-x-4 ml-auto">
          <span className="text-sm text-gray-600">
            Olá, <strong className="text-blue-700">{user?.username}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
