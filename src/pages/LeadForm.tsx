
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppValidation } from '@/hooks/useWhatsAppValidation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const LeadForm = () => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { validateWhatsApp, isValidating, validationResult, setValidationResult } = useWhatsAppValidation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventName, setEventName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [skipValidation, setSkipValidation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    course_id: '',
    message: ''
  });

  // Extrair parâmetros da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const event = urlParams.get('event');
    const tracking = urlParams.get('tracking');
    
    if (event) {
      setEventName(decodeURIComponent(event));
    }
    if (tracking) {
      setTrackingId(tracking);
      sessionStorage.setItem('form_tracking_id', tracking);
      sessionStorage.setItem('form_event_name', event || '');
    }
  }, []);

  // Verificar se webhook está configurado no carregamento
  useEffect(() => {
    const checkWebhookConfig = async () => {
      try {
        const { data: settings } = await supabase
          .from('system_settings')
          .select('*')
          .eq('key', 'whatsapp_validation_webhook')
          .maybeSingle();

        if (!settings?.value) {
          console.log('Webhook não configurado - validação será pulada');
          setSkipValidation(true);
        }
      } catch (error) {
        console.error('Erro ao verificar configuração do webhook:', error);
        setSkipValidation(true);
      }
    };

    checkWebhookConfig();
  }, []);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const validateWhatsAppFormat = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11 && numbers.startsWith('1') === false;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.whatsapp || !validateWhatsAppFormat(formData.whatsapp)) {
        toast({
          title: "WhatsApp inválido",
          description: "Por favor, digite um número válido no formato (DD) 99999-9999",
          variant: "destructive",
        });
        return;
      }

      // Se validação está configurada e ainda não validou, tentar validar
      if (!skipValidation && validationResult !== 'valid') {
        console.log('Tentando validar WhatsApp...');
        const isValid = await validateWhatsApp(formData.whatsapp);
        if (!isValid) {
          return;
        }
      } else {
        console.log('Validação pulada ou já realizada');
      }
    }
    
    if (currentStep === 2) {
      if (!formData.name || !formData.email) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha nome e email",
          variant: "destructive",
        });
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Email inválido",
          description: "Por favor, digite um email válido",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!formData.course_id) {
      toast({
        title: "Curso obrigatório",
        description: "Por favor, selecione um curso",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar o evento pelo nome se disponível
      let eventId = null;
      if (eventName) {
        const { data: events } = await supabase
          .from('events')
          .select('id')
          .eq('name', eventName)
          .limit(1);
        
        if (events && events.length > 0) {
          eventId = events[0].id;
        }
      }

      const leadData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        course_id: formData.course_id,
        message: formData.message || null,
        event_id: eventId,
        source: 'form'
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (leadError) throw leadError;

      // Se há tracking ID, criar/atualizar sessão de scan
      if (trackingId) {
        const { data: qrCodes } = await supabase
          .from('qr_codes')
          .select('id, event_id')
          .eq('tracking_id', trackingId)
          .limit(1);

        if (qrCodes && qrCodes.length > 0) {
          const qrCode = qrCodes[0];
          const sessionId = sessionStorage.getItem('scan_session_id') || crypto.randomUUID();
          
          const { error: sessionError } = await supabase
            .from('scan_sessions')
            .upsert({
              id: sessionId,
              qr_code_id: qrCode.id,
              event_id: qrCode.event_id,
              scanned_at: new Date().toISOString(),
              converted: true,
              converted_at: new Date().toISOString(),
              lead_id: lead.id,
              user_agent: navigator.userAgent,
              ip_address: 'form_submission'
            });

          if (sessionError) {
            console.error('Erro ao registrar sessão:', sessionError);
          }

          await supabase
            .from('leads')
            .update({ scan_session_id: sessionId })
            .eq('id', lead.id);

          sessionStorage.setItem('scan_session_id', sessionId);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Seus dados foram enviados com sucesso. Entraremos em contato em breve!",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        course_id: '',
        message: ''
      });
      setCurrentStep(1);
      setValidationResult(null);

      sessionStorage.removeItem('form_tracking_id');
      sessionStorage.removeItem('form_event_name');
      sessionStorage.removeItem('scan_session_id');

    } catch (error: any) {
      console.error('Erro ao enviar dados:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {eventName ? `${eventName}` : 'Interesse em nossos cursos?'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Preencha os dados abaixo e entraremos em contato
          </CardDescription>
          {trackingId && (
            <div className="text-xs text-muted-foreground mt-2">
              ID: {trackingId}
            </div>
          )}
          {skipValidation && (
            <div className="text-xs text-yellow-600 mt-2">
              Validação WhatsApp não configurada
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: WhatsApp com validação */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <h3 className="font-semibold">Seu WhatsApp</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <div className="relative">
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    maxLength={15}
                    className={`${!validateWhatsAppFormat(formData.whatsapp) && formData.whatsapp ? 'border-red-500' : ''} ${validationResult === 'valid' ? 'border-green-500' : ''}`}
                    disabled={isValidating}
                  />
                  {/* Ícones de status de validação */}
                  {!skipValidation && validationResult === 'valid' && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                  )}
                  {!skipValidation && validationResult === 'invalid' && (
                    <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-600" />
                  )}
                  {isValidating && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
                
                {/* Mensagens de status */}
                {!validateWhatsAppFormat(formData.whatsapp) && formData.whatsapp && (
                  <p className="text-sm text-red-500">Formato inválido</p>
                )}
                {isValidating && (
                  <p className="text-sm text-blue-600">Verificando número...</p>
                )}
                {!skipValidation && validationResult === 'valid' && (
                  <p className="text-sm text-green-600">Número verificado ✓</p>
                )}
                {!skipValidation && validationResult === 'invalid' && (
                  <p className="text-sm text-red-500">Número não encontrado ou inválido</p>
                )}
                {skipValidation && (
                  <p className="text-sm text-yellow-600">Validação não está configurada</p>
                )}
              </div>
              
              <Button
                onClick={handleNext}
                className="w-full"
                disabled={!validateWhatsAppFormat(formData.whatsapp) || isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Próximo'
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <h3 className="font-semibold">Seus dados</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  disabled={!formData.name || !formData.email}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <h3 className="font-semibold">Interesse</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Curso de interesse *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Conte-nos mais sobre seu interesse..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isSubmitting || !formData.course_id}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 pt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
