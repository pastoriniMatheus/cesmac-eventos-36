
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSupabaseData';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { data: systemSettings = [] } = useSystemSettings();
  
  const logoSetting = systemSettings.find((s: any) => s.key === 'logo');
  const logoUrl = logoSetting ? (typeof logoSetting.value === 'string' ? logoSetting.value : JSON.parse(logoSetting.value)) : '';

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          )}
          <h1 className="text-xl font-semibold">CESMAC - Gestão de Leads</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
