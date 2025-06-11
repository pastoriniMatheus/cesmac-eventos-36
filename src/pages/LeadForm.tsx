
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle, Phone, Mail, User, GraduationCap } from 'lucide-react';
import { useCourses, useSystemSettings } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  course_id: string;
  shift: string;
}

interface ValidationStatus {
  status: 'idle' | 'validating' | 'valid' | 'invalid' | 'error';
  message?: string;
}

const LeadForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    course_id: '',
    shift: ''
  });
  const [whatsappValidation, setWhatsappValidation] = useState<ValidationStatus>({ status: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationId, setValidationId] = useState<string | null>(null);

  const { data: courses = [] } = useCourses();
  const { data: settings = [] } = useSystemSettings();
  const { toast } = useToast();

  const getSetting = (key: string) => {
    const setting = settings.find((s: any) => s.key === key);
    if (!setting) return null;
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      return setting.value;
    }
  };

  const logo = getSetting('company_logo');
  const companyName = getSetting('company_name') || 'Sistema de Leads';

  const steps = [
    { id: 'name', label: 'Nome completo', icon: User },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'course', label: 'Curso de interesse', icon: GraduationCap },
    { id: 'shift', label: 'Turno preferido', icon: GraduationCap }
  ];

  // Verificar cookies para pré-preenchimento
  useEffect(() => {
    const savedData = localStorage.getItem('leadFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < oneHour) {
          setFormData(parsed.data);
          toast({
            title: "Dados recuperados",
            description: "Seus dados foram recuperados automaticamente.",
          });
        } else {
          localStorage.removeItem('leadFormData');
        }
      } catch (error) {
        localStorage.removeItem('leadFormData');
      }
    }
  }, []);

  // Salvar dados no localStorage a cada mudança
  useEffect(() => {
    const dataToSave = {
      data: formData,
      timestamp: Date.now()
    };
    localStorage.setItem('leadFormData', JSON.stringify(dataToSave));
  }, [formData]);

  // Polling para verificar status da validação do WhatsApp
  useEffect(() => {
    if (validationId && whatsappValidation.status === 'validating') {
      const interval = setInterval(async () => {
        try {
          // Query the whatsapp_validations table directly
          const { data, error } = await supabase
            .from('whatsapp_validations')
            .select('status, response_message')
            .eq('id', validationId)
            .single();

          if (error) {
            console.error('Erro ao verificar validação:', error);
            return;
          }

          if (data && data.status !== 'pending') {
            clearInterval(interval);
            if (data.status === 'valid') {
              setWhatsappValidation({ status: 'valid', message: 'WhatsApp válido!' });
              setCurrentStep(2); // Avançar para email
            } else {
              setWhatsappValidation({ 
                status: 'invalid', 
                message: data.response_message || 'WhatsApp inválido. Verifique o número.' 
              });
            }
          }
        } catch (error) {
          console.error('Erro no polling:', error);
          clearInterval(interval);
          setWhatsappValidation({ status: 'error', message: 'Erro na validação' });
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [validationId, whatsappValidation.status]);

  const validateWhatsApp = async (whatsapp: string) => {
    const newValidationId = crypto.randomUUID();
    setValidationId(newValidationId);
    setWhatsappValidation({ status: 'validating' });

    try {
      const response = await supabase.functions.invoke('validate-whatsapp', {
        body: {
          whatsapp,
          validation_id: newValidationId
        }
      });

      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      setWhatsappValidation({ status: 'error', message: 'Erro na validação. Tente novamente.' });
    }
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.id === 'name' && formData.name.trim()) {
      setCurrentStep(1);
    } else if (currentStepData.id === 'whatsapp' && formData.whatsapp.trim()) {
      if (whatsappValidation.status === 'valid') {
        setCurrentStep(2);
      } else if (whatsappValidation.status === 'idle') {
        validateWhatsApp(formData.whatsapp);
      }
    } else if (currentStepData.id === 'email' && formData.email.trim()) {
      setCurrentStep(3);
    } else if (currentStepData.id === 'course' && formData.course_id) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await supabase.functions.invoke('lead-capture', {
        body: {
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          course_id: formData.course_id,
          shift: formData.shift
        }
      });

      if (response.error) {
        throw response.error;
      }

      // Limpar dados salvos
      localStorage.removeItem('leadFormData');
      
      toast({
        title: "Cadastro realizado!",
        description: "Seus dados foram registrados com sucesso. Em breve entraremos em contato!",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        course_id: '',
        shift: ''
      });
      setCurrentStep(0);
      setWhatsappValidation({ status: 'idle' });
      
    } catch (error: any) {
      console.error('Erro ao submeter:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao registrar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'name': return formData.name.trim().length > 0;
      case 'whatsapp': return formData.whatsapp.trim().length > 0 && whatsappValidation.status === 'valid';
      case 'email': return formData.email.trim().length > 0 && formData.email.includes('@');
      case 'course': return formData.course_id.length > 0;
      case 'shift': return formData.shift.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const StepIcon = step.icon;

    switch (step.id) {
      case 'name':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <StepIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Qual é o seu nome?</h2>
                <p className="text-gray-600">Como podemos te chamar?</p>
              </div>
            </div>
            <Input
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="text-lg py-6"
              autoFocus
            />
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <StepIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Qual o seu WhatsApp?</h2>
                <p className="text-gray-600">Vamos validar se o número está ativo</p>
              </div>
            </div>
            <Input
              placeholder="(11) 99999-9999"
              value={formData.whatsapp}
              onChange={(e) => {
                setFormData({...formData, whatsapp: e.target.value});
                setWhatsappValidation({ status: 'idle' });
              }}
              className="text-lg py-6"
              autoFocus
            />
            {whatsappValidation.status === 'validating' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validando WhatsApp...</span>
              </div>
            )}
            {whatsappValidation.status === 'valid' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{whatsappValidation.message}</span>
              </div>
            )}
            {whatsappValidation.status === 'invalid' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{whatsappValidation.message}</span>
              </div>
            )}
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-full">
                <StepIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">E qual o seu e-mail?</h2>
                <p className="text-gray-600">Para enviarmos informações importantes</p>
              </div>
            </div>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="text-lg py-6"
              autoFocus
            />
          </div>
        );

      case 'course':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <StepIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Qual curso te interessa?</h2>
                <p className="text-gray-600">Escolha o curso que mais desperta seu interesse</p>
              </div>
            </div>
            <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
              <SelectTrigger className="text-lg py-6">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'shift':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-full">
                <StepIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Qual turno prefere?</h2>
                <p className="text-gray-600">Quando seria melhor para você estudar?</p>
              </div>
            </div>
            <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
              <SelectTrigger className="text-lg py-6">
                <SelectValue placeholder="Selecione um turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manhã">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noite">Noite</SelectItem>
                <SelectItem value="integral">Integral</SelectItem>
                <SelectItem value="fins de semana">Fins de semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-8">
          {logo && (
            <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-800">{companyName}</h1>
          <p className="text-gray-600">Cadastre-se para receber mais informações</p>
          
          {/* Progress bar */}
          <div className="flex justify-center space-x-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={whatsappValidation.status === 'validating'}
              >
                Voltar
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    !isStepValid(currentStep) || 
                    whatsappValidation.status === 'validating' ||
                    (steps[currentStep].id === 'whatsapp' && whatsappValidation.status !== 'valid')
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {whatsappValidation.status === 'validating' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validando...
                    </>
                  ) : (
                    'Próximo'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cadastrando...
                    </>
                  ) : (
                    'Concluir Cadastro'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
