
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Globe, ExternalLink, Code, Database, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiDocumentation = () => {
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const baseUrl = 'https://dobtquebpcnzjisftcfh.supabase.co/functions/v1';

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const endpoints = [
    {
      id: 'qr-redirect',
      name: 'QR Code Redirect',
      method: 'GET',
      path: '/qr-redirect/{short_url}',
      description: 'Redireciona QR codes e registra sessões de scan',
      category: 'qr',
      public: true,
      params: [
        { name: 'short_url', type: 'string', description: 'URL curta do QR code', location: 'path' }
      ],
      responses: [
        { status: 302, description: 'Redirecionamento para URL original' },
        { status: 404, description: 'QR code não encontrado' }
      ],
      example: `${baseUrl}/qr-redirect/abc123`
    },
    {
      id: 'lead-capture',
      name: 'Captura de Leads',
      method: 'POST',
      path: '/lead-capture',
      description: 'Recebe dados de formulário e cria leads com vinculação automática ao QR code',
      category: 'leads',
      public: true,
      headers: [
        { name: 'Content-Type', value: 'application/json' }
      ],
      body: {
        name: 'string (obrigatório) - Nome completo do lead',
        email: 'string (obrigatório) - Email válido',
        whatsapp: 'string (obrigatório) - Número com DDD (ex: 5582999501666)',
        course_id: 'uuid (opcional) - ID do curso de graduação',
        course_name: 'string (opcional) - Nome do curso (busca automaticamente o ID)',
        shift: 'string (opcional) - Turno de interesse (matutino, vespertino, noturno, integral)',
        tracking_id: 'string (opcional) - ID para vincular ao QR code escaneado'
      },
      fieldsDetail: {
        automaticFields: {
          course_type: 'Definido automaticamente como "course" ou "postgraduate"',
          source: 'Definido automaticamente como "form"',
          status_id: 'Busca status "pendente" como padrão',
          scan_session_id: 'Vincula à sessão de scan via tracking_id',
          event_id: 'Obtido do QR code via tracking_id'
        },
        businessLogic: {
          courseResolution: 'Se course_name for enviado sem course_id, busca o curso pelo nome',
          trackingFlow: 'tracking_id vincula o lead à sessão de scan do QR code',
          conversionTracking: 'Sessão de scan é marcada como convertida automaticamente'
        }
      },
      responses: [
        { status: 200, description: 'Lead criado com sucesso' },
        { status: 400, description: 'Campos obrigatórios faltando ou curso não encontrado' },
        { status: 500, description: 'Erro interno do servidor' }
      ],
      example: `${baseUrl}/lead-capture`,
      examplePayload: {
        name: "Matheus Aciolly",
        email: "joao@email.com",
        whatsapp: "5582999501666",
        course_name: "Administração",
        shift: "noturno",
        tracking_id: "nPDr2H"
      }
    },
    {
      id: 'validate-whatsapp',
      name: 'Validação WhatsApp',
      method: 'POST',
      path: '/validate-whatsapp',
      description: 'Valida números de WhatsApp via webhook externo',
      category: 'whatsapp',
      public: false,
      headers: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: 'Bearer {token}' }
      ],
      body: {
        whatsapp: 'string (obrigatório)',
        validation_id: 'uuid (obrigatório)'
      },
      responses: [
        { status: 200, description: 'Validação iniciada' },
        { status: 400, description: 'Webhook não configurado' }
      ],
      example: `${baseUrl}/validate-whatsapp`
    },
    {
      id: 'whatsapp-validation-callback',
      name: 'Callback Validação WhatsApp',
      method: 'POST/GET',
      path: '/whatsapp-validation-callback',
      description: 'Recebe resposta da validação do WhatsApp',
      category: 'whatsapp',
      public: true,
      params: [
        { name: 'validation_id', type: 'uuid', description: 'ID da validação', location: 'body/query' },
        { name: 'is_valid', type: 'boolean', description: 'Se o número é válido', location: 'body/query' },
        { name: 'message', type: 'string', description: 'Mensagem opcional', location: 'body/query' }
      ],
      responses: [
        { status: 200, description: 'Validação atualizada' },
        { status: 404, description: 'Validação não encontrada' }
      ],
      example: `${baseUrl}/whatsapp-validation-callback`
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'qr': return <ExternalLink className="h-4 w-4" />;
      case 'leads': return <Database className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'qr': return 'bg-blue-100 text-blue-800';
      case 'leads': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Documentação da API</span>
          </CardTitle>
          <CardDescription>
            Endpoints disponíveis para integração com o sistema de QR codes e leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Base URL:</h3>
            <div className="flex items-center space-x-2">
              <code className="bg-background px-2 py-1 rounded text-sm flex-1">
                {baseUrl}
              </code>
              <button
                onClick={() => copyToClipboard(baseUrl, 'base-url')}
                className="p-2 hover:bg-background rounded"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Tabs defaultValue="endpoints" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Autenticação</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getCategoryIcon(endpoint.category)}
                        <span>{endpoint.name}</span>
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {endpoint.method}
                        </Badge>
                        <Badge 
                          variant={endpoint.public ? 'outline' : 'destructive'}
                          className="ml-1"
                        >
                          {endpoint.public ? 'Público' : 'Autenticado'}
                        </Badge>
                      </CardTitle>
                      <Badge className={getCategoryColor(endpoint.category)}>
                        {endpoint.category.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">URL:</h4>
                      <div className="flex items-center space-x-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                          {endpoint.example}
                        </code>
                        <button
                          onClick={() => copyToClipboard(endpoint.example, endpoint.id)}
                          className="p-2 hover:bg-muted rounded"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {endpoint.headers && (
                      <div>
                        <h4 className="font-semibold mb-2">Headers:</h4>
                        <div className="space-y-1">
                          {endpoint.headers.map((header, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <code className="bg-muted px-2 py-1 rounded">{header.name}:</code>
                              <code className="text-muted-foreground">{header.value}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.params && (
                      <div>
                        <h4 className="font-semibold mb-2">Parâmetros:</h4>
                        <div className="space-y-1">
                          {endpoint.params.map((param, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              <span className="text-muted-foreground">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.body && (
                      <div>
                        <h4 className="font-semibold mb-2">Body (JSON):</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <pre>{JSON.stringify(endpoint.body, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {endpoint.fieldsDetail && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Campos Automáticos:</h4>
                          <div className="space-y-2">
                            {Object.entries(endpoint.fieldsDetail.automaticFields).map(([field, desc]) => (
                              <div key={field} className="flex items-start space-x-2 text-sm">
                                <code className="bg-muted px-2 py-1 rounded">{field}</code>
                                <span className="text-muted-foreground">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Lógica de Negócio:</h4>
                          <div className="space-y-2">
                            {Object.entries(endpoint.fieldsDetail.businessLogic).map(([key, desc]) => (
                              <div key={key} className="flex items-start space-x-2 text-sm">
                                <Badge variant="outline" className="text-xs">{key}</Badge>
                                <span className="text-muted-foreground">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {endpoint.examplePayload && (
                      <div>
                        <h4 className="font-semibold mb-2">Exemplo de Payload:</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <pre>{JSON.stringify(endpoint.examplePayload, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Respostas:</h4>
                      <div className="space-y-1">
                        {endpoint.responses.map((response, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            <Badge 
                              variant={response.status < 400 ? 'default' : 'destructive'}
                              className="w-12 justify-center"
                            >
                              {response.status}
                            </Badge>
                            <span className="text-muted-foreground">{response.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Autenticação</CardTitle>
                  <CardDescription>
                    Como autenticar suas requisições para endpoints protegidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Bearer Token:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Para endpoints que requerem autenticação, use o header Authorization:
                    </p>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      Authorization: Bearer YOUR_SUPABASE_ANON_KEY
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Endpoints Públicos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• QR Code Redirect - não requer autenticação</li>
                      <li>• Lead Capture - não requer autenticação</li>
                      <li>• WhatsApp Validation Callback - não requer autenticação</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Endpoints Protegidos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• WhatsApp Validation - requer autenticação</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de Webhooks</CardTitle>
                  <CardDescription>
                    Como configurar webhooks para receber dados do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">WhatsApp Validation Callback:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Para configurar seu chatbot WhatsApp para enviar validações de volta:
                    </p>
                    <div className="bg-muted p-3 rounded text-sm space-y-2">
                      <p><strong>URL do Callback:</strong></p>
                      <code className="block bg-background px-2 py-1 rounded">
                        {baseUrl}/whatsapp-validation-callback
                      </code>
                      <p><strong>Método:</strong> POST ou GET</p>
                      <p><strong>Parâmetros necessários:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>validation_id: UUID da validação</li>
                        <li>is_valid: true/false se o número é válido</li>
                        <li>message: mensagem opcional</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de Payload:</h4>
                    <div className="bg-muted p-3 rounded text-sm">
                      <pre>{JSON.stringify({
                        validation_id: "123e4567-e89b-12d3-a456-426614174000",
                        is_valid: true,
                        message: "Número válido e ativo"
                      }, null, 2)}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Lead Capture via Chatbot:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Para enviar leads coletados pelo seu chatbot:
                    </p>
                    <div className="bg-muted p-3 rounded text-sm">
                      <p><strong>URL:</strong> {baseUrl}/lead-capture</p>
                      <p><strong>Método:</strong> POST</p>
                      <p><strong>Content-Type:</strong> application/json</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'qr': return <ExternalLink className="h-4 w-4" />;
    case 'leads': return <Database className="h-4 w-4" />;
    case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'qr': return 'bg-blue-100 text-blue-800';
    case 'leads': return 'bg-green-100 text-green-800';
    case 'whatsapp': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default ApiDocumentation;
