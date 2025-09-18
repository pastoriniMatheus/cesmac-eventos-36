import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { BarChart3, Users, QrCode, MessageSquare, FileText, Shield, Zap, Target, CheckCircle, ArrowRight, GraduationCap, Building2, Database, Webhook, Mail, Phone, Bot, Smartphone, Clock, Globe, TrendingUp, Star, Award, Cpu, Download, Upload, Settings, Eye, Calendar, DollarSign } from 'lucide-react';
const Apresentacao = () => {
  const navigate = useNavigate();
  const {
    data: systemSettings = []
  } = useSystemSettings();
  const logoSetting = systemSettings.find((s: any) => s.key === 'logo');
  const logoUrl = logoSetting ? typeof logoSetting.value === 'string' ? logoSetting.value : JSON.parse(String(logoSetting.value)) : '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';
  
  const problemas = [
    "Perda de 40% dos leads por dados incorretos ou preenchimento errado",
    "WhatsApp inválido = impossibilidade de contato efetivo",
    "Zero controle de conversão: lead captado → matrícula efetivada",
    "Eventos múltiplos sem tracking individual de performance",
    "Leads 'fantasma' que nunca existiram de verdade",
    "Relatórios manuais que levam dias para gerar",
    "Impossibilidade de integrar com CRM/ERP existente",
    "Campanhas de remarketing genéricas sem segmentação"
  ];

  const funcionalidadesCore = [
    {
      icon: Bot,
      title: "WhatsApp + IA Integrada",
      desc: "Chatbot inteligente captura leads automaticamente via WhatsApp, valida dados em tempo real e impede cadastros falsos",
      highlight: "IA VALIDAÇÃO"
    },
    {
      icon: Shield,
      title: "Validação Anti-Fraude",
      desc: "Sistema bloqueia WhatsApp inexistente, CPF inválido e emails falsos antes mesmo de salvar no banco",
      highlight: "ZERO DADOS FALSOS"
    },
    {
      icon: QrCode,
      title: "QR Code + Tracking 360°",
      desc: "Cada evento gera QR único com tracking completo: quantos escanearam, quantos converteram, quando e onde",
      highlight: "TRACKING TOTAL"
    },
    {
      icon: BarChart3,
      title: "Dashboard Executivo Real-Time",
      desc: "Métricas ao vivo: conversão por evento, ROI por curso, leads por hora, rankings de performance",
      highlight: "TEMPO REAL"
    },
    {
      icon: Database,
      title: "Sincronização Automática",
      desc: "Integra com qualquer CRM/ERP via webhooks configuráveis. Dados fluem automaticamente para seus sistemas",
      highlight: "AUTO-SYNC"
    },
    {
      icon: FileText,
      title: "Relatórios PDF Automáticos",
      desc: "Relatórios completos por evento gerados automaticamente com gráficos, conversões e análises detalhadas",
      highlight: "AUTO-REPORTS"
    }
  ];

  const diferenciais = [
    {
      icon: Smartphone,
      title: "Captura Via WhatsApp",
      desc: "Lead vê evento → escaneia QR → abre WhatsApp automaticamente → IA captura dados conversando",
      destaque: "Não precisa digitar nada!"
    },
    {
      icon: Clock,
      title: "Sincronização Instantânea",
      desc: "Dados aparecem no seu CRM/sistema em menos de 5 segundos após captura",
      destaque: "Tempo real!"
    },
    {
      icon: Target,
      title: "Tracking de Conversão",
      desc: "Acompanhe desde o scan do QR até a matrícula efetivada. Nunca mais perca lead 'no meio do caminho'",
      destaque: "100% rastreável!"
    },
    {
      icon: Globe,
      title: "API Enterprise",
      desc: "Conecte com qualquer sistema: CRM, ERP, plataformas de email, sistemas de cobrança",
      destaque: "Integração total!"
    },
    {
      icon: Download,
      title: "Backup & Restore 1-Click",
      desc: "Exporte/importe toda base de dados com um clique. Migração entre ambientes sem dor de cabeça",
      destaque: "Migração fácil!"
    },
    {
      icon: Settings,
      title: "Customização Total",
      desc: "Webhooks configuráveis, campos personalizados, fluxos de automação sob medida",
      destaque: "Seu jeito!"
    }
  ];

  const resultados = [
    { numero: "95%", desc: "Redução de dados incorretos", icon: Shield },
    { numero: "300%", desc: "Aumento na conversão efetiva", icon: TrendingUp },
    { numero: "80%", desc: "Economia de tempo da equipe", icon: Clock },
    { numero: "100%", desc: "Leads com WhatsApp válido", icon: CheckCircle }
  ];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white">LeadSync</h1>
              <p className="text-sm text-blue-200">Inteligência na Captação</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => navigate('/install')} variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Instalar Sistema
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              Acessar Sistema
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-3xl"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Bot className="w-20 h-20 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-green-900" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            O Futuro da<br />Captação de Leads
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-4xl mx-auto leading-relaxed">
            <strong className="text-white">WhatsApp + IA + Validação Real-Time</strong><br />
            Zero dados falsos. 100% conversão rastreável. Integração total.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm">
            <span className="px-4 py-2 bg-green-500/20 text-green-100 rounded-full border border-green-400/30">
              ✓ Chatbot IA Integrado
            </span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-100 rounded-full border border-blue-400/30">
              ✓ Validação Anti-Fraude
            </span>
            <span className="px-4 py-2 bg-purple-500/20 text-purple-100 rounded-full border border-purple-400/30">
              ✓ Sync Tempo Real
            </span>
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-100 rounded-full border border-yellow-400/30">
              ✓ Dashboard Executivo
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Button size="lg" onClick={() => navigate('/install')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg shadow-lg shadow-green-500/30">
              <Download className="mr-2 h-6 w-6" />
              Instalar Agora - Grátis
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
              <Eye className="mr-2 h-6 w-6" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Problemas */}
      <section className="py-20 px-6 bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              A Realidade Brutal dos Eventos
            </h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Você investe milhares em eventos e perde <strong className="text-white">40% dos leads</strong> por problemas básicos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {problemas.map((problema, index) => (
              <Card key={index} className="border-red-300/20 bg-red-800/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-red-100 font-medium text-lg leading-relaxed">{problema}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-2xl text-white font-bold">
              💰 Resultado: <span className="text-red-300">Milhares perdidos em leads fantasma</span>
            </p>
          </div>
        </div>
      </section>

      {/* Funcionalidades Core */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              6 Funcionalidades que Mudam Tudo
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Cada funcionalidade foi projetada para resolver um problema específico do seu dia a dia
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funcionalidadesCore.map((func, index) => (
              <Card key={index} className="border-slate-600/30 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <func.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-bold text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-400/30">
                      {func.highlight}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-white mb-2">{func.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{func.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Como Funciona na Prática
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Do scan do QR até a integração com seu CRM - processo 100% automatizado
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <QrCode className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Lead Escaneia QR</h3>
              <p className="text-blue-100 text-lg">
                Pessoa interessada escaneia QR Code no seu evento. Automaticamente abre WhatsApp com mensagem pré-definida.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. IA Captura Dados</h3>
              <p className="text-blue-100 text-lg">
                Chatbot IA conversa naturalmente, valida WhatsApp/email em tempo real, captura dados com 0% erro.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Database className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Sincroniza CRM</h3>
              <p className="text-blue-100 text-lg">
                Lead aparece instantaneamente no seu CRM/sistema via webhook. Equipe comercial pode agir em segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Únicos */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por Que Somos Únicos no Mercado
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Nenhum outro sistema oferece essa combinação de tecnologias
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diferenciais.map((diferencial, index) => (
              <Card key={index} className="border-slate-700/30 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/40 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <diferencial.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white mb-2">{diferencial.title}</CardTitle>
                  <p className="text-sm font-bold text-indigo-400">{diferencial.destaque}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{diferencial.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-24 px-6 bg-gradient-to-br from-green-900 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Resultados Reais de Clientes
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Números de empresas que implementaram o LeadSync em 2024
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resultados.map((resultado, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <resultado.icon className="w-12 h-12 text-green-300" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-4">
                  {resultado.numero}
                </div>
                <div className="text-lg text-green-100">
                  {resultado.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <blockquote className="text-2xl text-white italic mb-4">
                "Em 3 meses, triplicamos nossa conversão de leads e eliminamos 100% dos dados falsos. 
                O ROI foi impressionante."
              </blockquote>
              <p className="text-green-200">
                - Diretora de Marketing, Faculdade de Medicina
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Precificação Transparente
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Sem surpresas. Sem mensalidades ocultas. Você paga pelo que usa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Starter */}
            <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Starter</CardTitle>
                <div className="text-4xl font-bold text-blue-400 mt-4">R$ 297</div>
                <p className="text-slate-400">por mês</p>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Até 500 leads/mês</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> QR Codes ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Validação WhatsApp</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Dashboard básico</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> 1 integração webhook</li>
                </ul>
              </CardContent>
            </Card>

            {/* Plano Pro */}
            <Card className="border-blue-500/50 bg-blue-900/30 backdrop-blur-sm relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  MAIS POPULAR
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Professional</CardTitle>
                <div className="text-4xl font-bold text-blue-400 mt-4">R$ 597</div>
                <p className="text-slate-400">por mês</p>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Até 2.000 leads/mês</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Chatbot IA WhatsApp</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Dashboard executivo</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Relatórios PDF automáticos</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Webhooks ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Suporte prioritário</li>
                </ul>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-purple-500/50 bg-purple-900/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-purple-400 mt-4">Custom</div>
                <p className="text-slate-400">sob demanda</p>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Leads ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> API customizada</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Instalação on-premise</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Suporte 24/7</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Customizações</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Consultoria estratégica</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Transforme Seus Eventos em 
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent"> Máquinas de Conversão</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
              Pare de perder dinheiro com leads falsos.<br />
              <strong className="text-white">Comece hoje mesmo</strong> e veja a diferença em 24 horas.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <Button size="lg" onClick={() => navigate('/install')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-5 text-xl shadow-2xl shadow-green-500/30 transform hover:scale-105 transition-all">
                <Download className="mr-3 h-6 w-6" />
                Instalar Sistema - 100% Grátis
              </Button>
              <Button size="lg" onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-5 text-xl shadow-2xl shadow-blue-500/30">
                <ArrowRight className="mr-3 h-6 w-6" />
                Acessar Sistema
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-bold">Instalação Gratuita</p>
                <p className="text-blue-200 text-sm">Setup completo em 5 minutos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Clock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white font-bold">Resultados em 24h</p>
                <p className="text-blue-200 text-sm">Veja a diferença imediatamente</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-white font-bold">Garantia Total</p>
                <p className="text-blue-200 text-sm">30 dias ou seu dinheiro de volta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
                <div>
                  <span className="text-2xl font-bold">LeadSync</span>
                  <p className="text-gray-400">Inteligência na Captação</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                A primeira plataforma brasileira que combina WhatsApp, IA e validação em tempo real 
                para captação de leads em eventos. Zero dados falsos, máxima conversão.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-400">Produto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="/install" className="hover:text-white transition-colors">Instalação</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-blue-400">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 LeadSync. Desenvolvido para revolucionar a captação de leads em eventos.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Apresentacao;