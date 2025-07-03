
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSettings = () => {
  const [formConfig, setFormConfig] = useState({
    title: 'Título do formulário',
    subtitle: 'Subtítulo do formulário',
    description: 'Descrição do formulário',
    thankYouTitle: 'Obrigado!',
    thankYouDescription: 'Sua inscrição foi realizada com sucesso!',
    redirectUrl: 'https://exemplo.com/obrigado',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    buttonColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações do formulário salvas",
      description: "As configurações do formulário foram atualizadas com sucesso!",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Configurações do Formulário</span>
        </CardTitle>
        <CardDescription>
          Personalize o formulário de captura de leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Textos do Formulário</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Título do Formulário</Label>
              <Input
                id="form-title"
                value={formConfig.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título do formulário"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-subtitle">Subtítulo do Formulário</Label>
              <Input
                id="form-subtitle"
                value={formConfig.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Subtítulo do formulário"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">Descrição do Formulário</Label>
            <Textarea
              id="form-description"
              value={formConfig.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do formulário"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thank-you-title">Título da Página de Agradecimento</Label>
              <Input
                id="thank-you-title"
                value={formConfig.thankYouTitle}
                onChange={(e) => handleChange('thankYouTitle', e.target.value)}
                placeholder="Obrigado!"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="redirect-url">URL de Redirecionamento</Label>
              <Input
                id="redirect-url"
                value={formConfig.redirectUrl}
                onChange={(e) => handleChange('redirectUrl', e.target.value)}
                placeholder="https://exemplo.com/obrigado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank-you-description">Descrição da Página de Agradecimento</Label>
            <Textarea
              id="thank-you-description"
              value={formConfig.thankYouDescription}
              onChange={(e) => handleChange('thankYouDescription', e.target.value)}
              placeholder="Sua inscrição foi realizada com sucesso!"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cores do Formulário</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-primary">Cor Primária</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.primaryColor }}
                />
                <Input
                  id="form-primary"
                  value={formConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-secondary">Cor Secundária</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.secondaryColor }}
                />
                <Input
                  id="form-secondary"
                  value={formConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#f59e0b"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-button">Cor do Botão</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.buttonColor }}
                />
                <Input
                  id="form-button"
                  value={formConfig.buttonColor}
                  onChange={(e) => handleChange('buttonColor', e.target.value)}
                  placeholder="#10b981"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-bg">Cor de Fundo</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.backgroundColor }}
                />
                <Input
                  id="form-bg"
                  value={formConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-text">Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.textColor }}
                />
                <Input
                  id="form-text"
                  value={formConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Campos Personalizados</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Campo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Funcionalidade para adicionar campos personalizados em desenvolvimento.
          </p>
        </div>

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações do Formulário
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormSettings;
