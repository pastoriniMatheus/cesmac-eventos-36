
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

const FormSettings = () => {
  const { toast } = useToast();
  const { data: settings = [] } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  
  const [formConfig, setFormConfig] = useState({
    title: 'Cadastre-se agora',
    subtitle: 'Preencha seus dados',
    description: 'Complete o formulário abaixo para se inscrever',
    thankYouTitle: 'Obrigado!',
    thankYouMessage: 'Sua inscrição foi realizada com sucesso!',
    redirectUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    buttonColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fieldBackgroundColor: '#f9fafb',
    fieldBorderColor: '#d1d5db'
  });

  useEffect(() => {
    // Carregar configurações do banco
    settings.forEach(setting => {
      const key = setting.key;
      const value = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
      
      switch (key) {
        case 'form_title':
          setFormConfig(prev => ({ ...prev, title: value }));
          break;
        case 'form_subtitle':
          setFormConfig(prev => ({ ...prev, subtitle: value }));
          break;
        case 'form_description':
          setFormConfig(prev => ({ ...prev, description: value }));
          break;
        case 'form_thank_you_title':
          setFormConfig(prev => ({ ...prev, thankYouTitle: value }));
          break;
        case 'form_thank_you_message':
          setFormConfig(prev => ({ ...prev, thankYouMessage: value }));
          break;
        case 'form_redirect_url':
          setFormConfig(prev => ({ ...prev, redirectUrl: value }));
          break;
        case 'form_primary_color':
          setFormConfig(prev => ({ ...prev, primaryColor: value }));
          break;
        case 'form_secondary_color':
          setFormConfig(prev => ({ ...prev, secondaryColor: value }));
          break;
        case 'form_button_color':
          setFormConfig(prev => ({ ...prev, buttonColor: value }));
          break;
        case 'form_background_color':
          setFormConfig(prev => ({ ...prev, backgroundColor: value }));
          break;
        case 'form_text_color':
          setFormConfig(prev => ({ ...prev, textColor: value }));
          break;
        case 'form_field_background_color':
          setFormConfig(prev => ({ ...prev, fieldBackgroundColor: value }));
          break;
        case 'form_field_border_color':
          setFormConfig(prev => ({ ...prev, fieldBorderColor: value }));
          break;
      }
    });
  }, [settings]);

  const handleSave = async () => {
    try {
      const settingsToSave = [
        { key: 'form_title', value: formConfig.title },
        { key: 'form_subtitle', value: formConfig.subtitle },
        { key: 'form_description', value: formConfig.description },
        { key: 'form_thank_you_title', value: formConfig.thankYouTitle },
        { key: 'form_thank_you_message', value: formConfig.thankYouMessage },
        { key: 'form_redirect_url', value: formConfig.redirectUrl },
        { key: 'form_primary_color', value: formConfig.primaryColor },
        { key: 'form_secondary_color', value: formConfig.secondaryColor },
        { key: 'form_button_color', value: formConfig.buttonColor },
        { key: 'form_background_color', value: formConfig.backgroundColor },
        { key: 'form_text_color', value: formConfig.textColor },
        { key: 'form_field_background_color', value: formConfig.fieldBackgroundColor },
        { key: 'form_field_border_color', value: formConfig.fieldBorderColor }
      ];

      for (const setting of settingsToSave) {
        await updateSetting.mutateAsync(setting);
      }

      toast({
        title: "Configurações do formulário salvas",
        description: "As configurações do formulário foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar as configurações do formulário",
        variant: "destructive",
      });
    }
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
            <Label htmlFor="thank-you-message">Mensagem de Agradecimento</Label>
            <Textarea
              id="thank-you-message"
              value={formConfig.thankYouMessage}
              onChange={(e) => handleChange('thankYouMessage', e.target.value)}
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
                  type="color"
                  value={formConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
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
                  type="color"
                  value={formConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
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
                  type="color"
                  value={formConfig.buttonColor}
                  onChange={(e) => handleChange('buttonColor', e.target.value)}
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
                  type="color"
                  value={formConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
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
                  type="color"
                  value={formConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-bg">Cor de Fundo dos Campos</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.fieldBackgroundColor }}
                />
                <Input
                  id="field-bg"
                  type="color"
                  value={formConfig.fieldBackgroundColor}
                  onChange={(e) => handleChange('fieldBackgroundColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field-border">Cor da Borda dos Campos</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formConfig.fieldBorderColor }}
                />
                <Input
                  id="field-border"
                  type="color"
                  value={formConfig.fieldBorderColor}
                  onChange={(e) => handleChange('fieldBorderColor', e.target.value)}
                />
              </div>
            </div>
          </div>
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
