
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, MessageSquare, Settings, QrCode } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white shadow-sm px-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
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
      </div>
    </header>
  );
};

export default Header;
