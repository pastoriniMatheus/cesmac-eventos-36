import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useFormSettings } from '@/hooks/useFormSettings';
import { useCheckExistingLead, useUpdateLeadCourse } from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppValidation } from '@/hooks/useWhatsAppValidation';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import ThankYouScreen from '@/components/ThankYouScreen';

const LeadForm = () => {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const { data: systemSettings = [] } = useSystemSettings();
  const { data: formSettings = [] } = useFormSettings();
  const { validateWhatsApp, isValidating, validationResult, setValidationResult } = useWhatsAppValidation();
  const checkExistingLead = useCheckExistingLead();
  const updateLeadCourse = useUpdateLeadCourse();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [eventName, setEventName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [skipValidation, setSkipValidation] = useState(false);
  const [existingLead, setExistingLead] = useState<any>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    course_id: ''
  });

  // Obter logo do sistema
  const logoSetting = systemSettings.find((s: any) => s.key === 'logo');
  const logoUrl = logoSetting ? 
    (typeof logoSetting.value === 'string' ? 
      logoSetting.value : 
      JSON.parse(String(logoSetting.value))
    ) : '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';

  // Obter configurações do formulário
  const thankYouTitleSetting = formSettings.find((s: any) => s.key === 'form_thank_you_title');
  const thankYouMessageSetting = formSettings.find((s: any) => s.key === 'form_thank_you_message');
  
  const thankYouTitle = thankYouTitleSetting ? 
    (typeof thankYouTitleSetting.value === 'string' ? 
      thankYouTitleSetting.value : 
      JSON.parse(String(thankYouTitleSetting.value))
    ) : 'Obrigado!';
    
  const thankYouMessage = thankYouMessageSetting ? 
    (typeof thankYouMessageSetting.value === 'string' ? 
      thankYouMessageSetting.value : 
      JSON.parse(String(thankYouMessageSetting.value))
    ) : 'Seus dados foram enviados com sucesso. Entraremos em contato em breve!';

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
      
      // Registrar scan para QR codes de formulário
      registerFormScan(tracking);
    }
  }, []);

  // Função para registrar scan de formulário
  const registerFormScan = async (trackingId: string) => {
    try {
      console.log('🔍 Registrando scan de formulário para tracking ID:', trackingId);
      
      // Buscar QR Code pelo tracking_id
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, event_id, scans')
        .eq('tracking_id', trackingId)
        .eq('type', 'form') // Apenas para QR codes de formulário
        .single();

      if (qrError) {
        console.log('❌ QR Code não encontrado:', qrError);
        return;
      }

      if (qrCode) {
        console.log('✅ QR Code encontrado:', qrCode);
        
        // Incrementar contador de scans
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ scans: (qrCode.scans || 0) + 1 })
          .eq('id', qrCode.id);

        if (updateError) {
          console.error('❌ Erro ao incrementar scans:', updateError);
        } else {
          console.log('✅ Contador de scans incrementado');
        }

        // Criar sessão de scan
        const sessionId = crypto.randomUUID();
        const { error: sessionError } = await supabase
          .from('scan_sessions')
          .insert({
            id: sessionId,
            qr_code_id: qrCode.id,
            event_id: qrCode.event_id,
            scanned_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: 'form_access'
          });

        if (sessionError) {
          console.error('❌ Erro ao criar sessão de scan:', sessionError);
        } else {
          console.log('✅ Sessão de scan criada:', sessionId);
          sessionStorage.setItem('scan_session_id', sessionId);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao registrar scan de formulário:', error);
    }
  };

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
    if (existingLead) {
      setExistingLead(null);
      setShowUpdateConfirm(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    if (existingLead) {
      setExistingLead(null);
      setShowUpdateConfirm(false);
    }
  };

  const handleCheckExistingLead = async () => {
    if (!formData.whatsapp && !formData.email) return;
    
    try {
      const result = await checkExistingLead.mutateAsync({
        whatsapp: formData.whatsapp,
        email: formData.email
      });
      
      if (result) {
        setExistingLead(result);
        setShowUpdateConfirm(true);
        setFormData(prev => ({
          ...prev,
          name: result.name,
          email: result.email,
          whatsapp: formatWhatsApp(result.whatsapp),
          course_id: result.course_id || ''
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.log('Lead não encontrado, continuando com cadastro novo');
      return false;
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

      // Verificar se o lead já existe
      const leadExists = await handleCheckExistingLead();
      if (leadExists && !showUpdateConfirm) {
        return; // Para mostrar a mensagem de confirmação
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

      // Se não foi verificado ainda, verificar se existe lead com este email
      if (!existingLead) {
        await handleCheckExistingLead();
        if (showUpdateConfirm) {
          return;
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleUpdateCourse = async () => {
    if (!existingLead || !formData.course_id) return;
    
    try {
      await updateLeadCourse.mutateAsync({
        leadId: existingLead.id,
        courseId: formData.course_id
      });
      
      setShowThankYou(true);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar curso",
        variant: "destructive",
      });
    }
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

    // Se é um lead existente, apenas atualizar o curso
    if (existingLead && showUpdateConfirm) {
      await handleUpdateCourse();
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

      // Buscar status padrão "pendente"
      let defaultStatusId = null;
      const { data: pendingStatus } = await supabase
        .from('lead_statuses')
        .select('id')
        .ilike('name', 'pendente')
        .limit(1);
      
      if (pendingStatus && pendingStatus.length > 0) {
        defaultStatusId = pendingStatus[0].id;
      }

      const leadData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        course_id: formData.course_id,
        event_id: eventId,
        source: 'form',
        status_id: defaultStatusId // Adicionar status padrão
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (leadError) throw leadError;

      // Se há tracking ID, criar/atualizar sessão de scan
      if (trackingId) {
        const scanSessionId = sessionStorage.getItem('scan_session_id');
        
        if (scanSessionId) {
          // Atualizar sessão existente como convertida
          const { error: sessionError } = await supabase
            .from('scan_sessions')
            .update({
              converted: true,
              converted_at: new Date().toISOString(),
              lead_id: lead.id
            })
            .eq('id', scanSessionId);

          if (sessionError) {
            console.error('Erro ao atualizar sessão:', sessionError);
          } else {
            console.log('✅ Sessão de scan atualizada como convertida');
          }

          // Vincular lead à sessão
          await supabase
            .from('leads')
            .update({ scan_session_id: scanSessionId })
            .eq('id', lead.id);
        } else {
          // Fallback: buscar QR code e criar sessão retroativamente
          const { data: qrCodes } = await supabase
            .from('qr_codes')
            .select('id, event_id')
            .eq('tracking_id', trackingId)
            .limit(1);

          if (qrCodes && qrCodes.length > 0) {
            const qrCode = qrCodes[0];
            const newSessionId = crypto.randomUUID();
            
            const { error: sessionError } = await supabase
              .from('scan_sessions')
              .insert({
                id: newSessionId,
                qr_code_id: qrCode.id,
                event_id: qrCode.event_id,
                scanned_at: new Date().toISOString(),
                converted: true,
                converted_at: new Date().toISOString(),
                lead_id: lead.id,
                user_agent: navigator.userAgent,
                ip_address: 'form_submission'
              });

            if (!sessionError) {
              await supabase
                .from('leads')
                .update({ scan_session_id: newSessionId })
                .eq('id', lead.id);
            }
          }
        }
      }

      // Em vez de mostrar toast e resetar form, mostrar tela de agradecimento
      setShowThankYou(true);

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

  const handleBackToForm = () => {
    setShowThankYou(false);
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      course_id: ''
    });
    setCurrentStep(1);
    setValidationResult(null);
    setExistingLead(null);
    setShowUpdateConfirm(false);

    sessionStorage.removeItem('form_tracking_id');
    sessionStorage.removeItem('form_event_name');
    sessionStorage.removeItem('scan_session_id');
  };

  // Se deve mostrar tela de agradecimento
  if (showThankYou) {
    return (
      <ThankYouScreen
        title={thankYouTitle}
        message={thankYouMessage}
        logoUrl={logoUrl}
        onBackToForm={handleBackToForm}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8 px-6">
            {/* Logo do sistema */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <img
                  src={logoUrl}
                  alt="Logo CESMAC"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
              {eventName ? `${eventName}` : 'Interesse em nossos cursos?'}
            </CardTitle>
            <CardDescription className="text-gray-700 text-base">
              Preencha os dados abaixo e entraremos em contato
            </CardDescription>
            {trackingId && (
              <div className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-full px-3 py-1 inline-block">
                ID: {trackingId}
              </div>
            )}
            {skipValidation && (
              <div className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-full px-3 py-1">
                Validação WhatsApp não configurada
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-8">
            {/* Alerta para lead existente */}
            {showUpdateConfirm && existingLead && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-2">
                    <p><strong>Lead já cadastrado!</strong></p>
                    <p>Nome: {existingLead.name}</p>
                    <p>Email: {existingLead.email}</p>
                    {existingLead.course && (
                      <p>Curso atual: {existingLead.course.name}</p>
                    )}
                    <p className="text-sm mt-2">Deseja atualizar o curso de interesse?</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: WhatsApp com validação */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-lg text-blue-900">Seu WhatsApp</h3>
                  <p className="text-sm text-gray-600 mt-1">Vamos verificar seu número</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-blue-900 font-medium">WhatsApp *</Label>
                  <div className="relative">
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={handleWhatsAppChange}
                      maxLength={15}
                      className={`h-12 text-lg border-2 transition-all duration-200 ${
                        !validateWhatsAppFormat(formData.whatsapp) && formData.whatsapp 
                          ? 'border-red-400 focus:border-red-500' 
                          : validationResult === 'valid'
                          ? 'border-green-400 focus:border-green-500'
                          : 'border-blue-200 focus:border-blue-500'
                      }`}
                      disabled={isValidating || checkExistingLead.isPending}
                    />
                    {/* Ícones de status de validação */}
                    {!skipValidation && validationResult === 'valid' && (
                      <CheckCircle className="absolute right-3 top-3 h-6 w-6 text-green-600" />
                    )}
                    {!skipValidation && validationResult === 'invalid' && (
                      <XCircle className="absolute right-3 top-3 h-6 w-6 text-red-600" />
                    )}
                    {isValidating && (
                      <Loader2 className="absolute right-3 top-3 h-6 w-6 animate-spin text-blue-600" />
                    )}
                  </div>
                  
                  {/* Mensagens de status */}
                  {!validateWhatsAppFormat(formData.whatsapp) && formData.whatsapp && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Formato inválido</p>
                  )}
                  {isValidating && (
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">Verificando número...</p>
                  )}
                  {!skipValidation && validationResult === 'valid' && (
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded">Número verificado ✓</p>
                  )}
                  {!skipValidation && validationResult === 'invalid' && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Número não encontrado ou inválido</p>
                  )}
                  {skipValidation && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">Validação não está configurada</p>
                  )}
                </div>
                
                <Button
                  onClick={handleNext}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  disabled={!validateWhatsAppFormat(formData.whatsapp) || isValidating || checkExistingLead.isPending}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : checkExistingLead.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando cadastro...
                    </>
                  ) : (
                    'Próximo'
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && !showUpdateConfirm && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-lg text-blue-900">Seus dados</h3>
                  <p className="text-sm text-gray-600 mt-1">Precisamos saber mais sobre você</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-900 font-medium">Nome completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome completo"
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-900 font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12 text-lg border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    disabled={!formData.name || !formData.email || checkExistingLead.isPending}
                  >
                    {checkExistingLead.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Próximo'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Confirmação de atualização para lead existente */}
            {showUpdateConfirm && existingLead && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-amber-700">Atualizar Interesse</h3>
                  <p className="text-sm text-gray-600 mt-1">Selecione o novo curso de interesse</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="course" className="text-blue-900 font-medium">Novo curso de interesse *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpdateConfirm(false);
                      setExistingLead(null);
                      setCurrentStep(1);
                    }}
                    className="flex-1 h-12 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateCourse}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                    disabled={updateLeadCourse.isPending || !formData.course_id}
                  >
                    {updateLeadCourse.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      'Atualizar'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Course Selection (apenas para leads novos) */}
            {currentStep === 3 && !showUpdateConfirm && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-lg text-blue-900">Interesse</h3>
                  <p className="text-sm text-gray-600 mt-1">Qual curso desperta seu interesse?</p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="course" className="text-blue-900 font-medium">Curso de interesse *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 h-12 text-lg border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                    disabled={isSubmitting || !formData.course_id}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress indicator */}
            <div className="flex justify-center space-x-3 pt-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step <= currentStep || showUpdateConfirm
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadForm;
