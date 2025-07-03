
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VisualSettings = () => {
  const [visualConfig, setVisualConfig] = useState({
    title: 'Título da apresentação',
    subtitle: 'Subtítulo da apresentação',
    description: 'Descrição da apresentação',
    logoUrl: 'https://exemplo.com/logo.png',
    faviconUrl: 'https://exemplo.com/favicon.ico',
    imageUrl: 'https://exemplo.com/imagem.jpg',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    highlightColor: '#6b7280',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações visuais salvas",
      description: "As configurações visuais foram atualizadas com sucesso!",
    });
  };

  const handleChange = (field: string, value: string) => {
    setVisualConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Configurações Visuais</span>
        </CardTitle>
        <CardDescription>
          Personalize a aparência e identidade visual do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Identidade Visual</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título Principal</Label>
              <Input
                id="title"
                value={visualConfig.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título da apresentação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={visualConfig.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Subtítulo da apresentação"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={visualConfig.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição da apresentação"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">URL do Logotipo</Label>
              <Input
                id="logo-url"
                value={visualConfig.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favicon-url">URL do Favicon</Label>
              <Input
                id="favicon-url"
                value={visualConfig.faviconUrl}
                onChange={(e) => handleChange('faviconUrl', e.target.value)}
                placeholder="https://exemplo.com/favicon.ico"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-url">URL da Imagem</Label>
              <Input
                id="image-url"
                value={visualConfig.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cores do Sistema</h3>
          <p className="text-sm text-muted-foreground">Configure as cores principais do sistema</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária (Azul)</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.primaryColor }}
                />
                <Input
                  id="primary-color"
                  value={visualConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária (Amarelo)</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.secondaryColor }}
                />
                <Input
                  id="secondary-color"
                  value={visualConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#64748b"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="highlight-color">Cor de Destaque (Cinza)</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.highlightColor }}
                />
                <Input
                  id="highlight-color"
                  value={visualConfig.highlightColor}
                  onChange={(e) => handleChange('highlightColor', e.target.value)}
                  placeholder="#6b7280"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bg-color">Cor de Fundo (Branco)</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.backgroundColor }}
                />
                <Input
                  id="bg-color"
                  value={visualConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-color">Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.textColor }}
                />
                <Input
                  id="text-color"
                  value={visualConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações Visuais
        </Button>
      </CardContent>
    </Card>
  );
};

export default VisualSettings;
