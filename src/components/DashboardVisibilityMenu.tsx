
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

export interface DashboardVisibility {
  stats: boolean;
  leadsByEvent: boolean;
  leadsByCourse: boolean;
  rankings: boolean;
  conversion: boolean;
}

interface DashboardVisibilityMenuProps {
  visibility: DashboardVisibility;
  onVisibilityChange: (visibility: DashboardVisibility) => void;
}

const DashboardVisibilityMenu = ({ visibility, onVisibilityChange }: DashboardVisibilityMenuProps) => {
  const handleToggle = (key: keyof DashboardVisibility) => {
    onVisibilityChange({
      ...visibility,
      [key]: !visibility[key]
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Visualização dos Painéis
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuCheckboxItem
          checked={visibility.stats}
          onCheckedChange={() => handleToggle('stats')}
        >
          Cards de Estatísticas
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.conversion}
          onCheckedChange={() => handleToggle('conversion')}
        >
          Métricas de Conversão
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.leadsByEvent}
          onCheckedChange={() => handleToggle('leadsByEvent')}
        >
          Leads por Evento
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.leadsByCourse}
          onCheckedChange={() => handleToggle('leadsByCourse')}
        >
          Leads por Curso
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.rankings}
          onCheckedChange={() => handleToggle('rankings')}
        >
          Rankings
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardVisibilityMenu;
