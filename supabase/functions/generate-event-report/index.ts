import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event_id } = await req.json();

    if (!event_id) {
      return new Response('Event ID is required', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar dados do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return new Response('Event not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Buscar QR codes do evento para determinar o tipo
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('type, scans, tracking_id')
      .eq('event_id', event_id);

    // Determinar tipos de QR codes disponíveis
    const qrTypes = qrCodes?.map(qr => qr.type || 'whatsapp') || [];
    const hasWhatsApp = qrTypes.includes('whatsapp');
    const hasForm = qrTypes.includes('form');
    
    let eventType = 'Não definido';
    if (hasWhatsApp && hasForm) {
      eventType = 'Híbrido (WhatsApp + Formulário)';
    } else if (hasWhatsApp) {
      eventType = 'WhatsApp';
    } else if (hasForm) {
      eventType = 'Formulário';
    } else if (event.whatsapp_number) {
      eventType = 'WhatsApp (legado)';
    }

    // Buscar leads do evento com verificação adicional de origem
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        course:courses(name),
        status:lead_statuses(name, color)
      `)
      .eq('event_id', event_id)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Erro ao buscar leads:', leadsError);
    }

    // Se não há QR codes mas há leads com source = 'form', considerar como formulário
    if ((!qrCodes || qrCodes.length === 0) && leads && leads.length > 0) {
      const formLeads = leads.filter(lead => lead.source === 'form');
      if (formLeads.length > 0) {
        eventType = 'Formulário (sem QR Code)';
      }
    }

    // Buscar sessões de scan
    const { data: scanSessions, error: scanError } = await supabase
      .from('scan_sessions')
      .select('*')
      .eq('event_id', event_id);

    if (scanError) {
      console.error('Erro ao buscar sessões:', scanError);
    }

    // Calcular métricas
    const totalLeads = leads?.length || 0;
    const totalScans = scanSessions?.length || 0;
    const convertedScans = scanSessions?.filter(s => s.converted)?.length || 0;
    const conversionRate = totalScans > 0 ? (convertedScans / totalScans) * 100 : 0;
    const totalQRScans = qrCodes?.reduce((sum, qr) => sum + (qr.scans || 0), 0) || 0;

    // Agrupar leads por status
    const leadsByStatus = leads?.reduce((acc: any, lead: any) => {
      const statusName = lead.status?.name || 'Sem status';
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {}) || {};

    // Agrupar leads por curso
    const leadsByCourse = leads?.reduce((acc: any, lead: any) => {
      const courseName = lead.course?.name || 'Não informado';
      acc[courseName] = (acc[courseName] || 0) + 1;
      return acc;
    }, {}) || {};

    // Gerar HTML do relatório
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório - ${event.name}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
                line-height: 1.6;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
            }
            .metrics { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 15px; 
                margin-bottom: 30px; 
            }
            .metric-card { 
                background: #f8fafc; 
                padding: 15px; 
                border-radius: 8px; 
                border-left: 4px solid #2563eb;
                text-align: center;
            }
            .metric-value { 
                font-size: 24px; 
                font-weight: bold; 
                color: #2563eb; 
            }
            .metric-label { 
                font-size: 12px; 
                color: #64748b; 
                margin-top: 5px;
            }
            .section { 
                margin-bottom: 30px; 
            }
            .section h3 { 
                color: #1e40af; 
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 10px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px;
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #e2e8f0; 
            }
            th { 
                background-color: #f1f5f9; 
                font-weight: bold;
                color: #475569;
            }
            tr:hover { 
                background-color: #f8fafc; 
            }
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .event-info {
                background: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #0ea5e9;
            }
            .qr-info {
                background: #fefce8;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #eab308;
            }
            @media print {
                body { margin: 0; }
                .metric-card { break-inside: avoid; }
                table { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório do Evento</h1>
            <h2>${event.name}</h2>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
        </div>

        <div class="event-info">
            <h3>📋 Informações do Evento</h3>
            <p><strong>Tipo de Evento:</strong> ${eventType}</p>
            <p><strong>Data de Criação:</strong> ${new Date(event.created_at).toLocaleDateString('pt-BR')}</p>
            ${event.whatsapp_number ? `<p><strong>WhatsApp:</strong> ${event.whatsapp_number}</p>` : ''}
            <p><strong>Total de QR Codes:</strong> ${qrCodes?.length || 0}</p>
        </div>

        ${qrCodes && qrCodes.length > 0 ? `
        <div class="qr-info">
            <h3>📱 QR Codes do Evento</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                ${qrCodes.map(qr => `
                    <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #d1d5db;">
                        <strong>Tipo:</strong> ${qr.type === 'form' ? 'Formulário' : 'WhatsApp'}<br>
                        <strong>ID:</strong> ${qr.tracking_id}<br>
                        <strong>Scans:</strong> ${qr.scans || 0}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${totalLeads}</div>
                <div class="metric-label">Total de Leads</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${totalQRScans}</div>
                <div class="metric-label">Total de Scans QR</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${totalScans}</div>
                <div class="metric-label">Sessões de Scan</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${convertedScans}</div>
                <div class="metric-label">Conversões</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${conversionRate.toFixed(1)}%</div>
                <div class="metric-label">Taxa de Conversão</div>
            </div>
        </div>

        <div class="section">
            <h3>📊 Leads por Status</h3>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Quantidade</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(leadsByStatus).map(([status, count]: [string, any]) => `
                        <tr>
                            <td>${status}</td>
                            <td>${count}</td>
                            <td>${((count / totalLeads) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>🎓 Leads por Curso</h3>
            <table>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Quantidade</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(leadsByCourse).map(([course, count]: [string, any]) => `
                        <tr>
                            <td>${course}</td>
                            <td>${count}</td>
                            <td>${((count / totalLeads) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>👥 Lista de Leads</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>WhatsApp</th>
                        <th>Curso</th>
                        <th>Status</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads?.map((lead: any) => `
                        <tr>
                            <td>${lead.name}</td>
                            <td>${lead.email}</td>
                            <td>${lead.whatsapp}</td>
                            <td>${lead.course?.name || 'N/A'}</td>
                            <td>
                                <span class="status-badge" style="background-color: ${lead.status?.color || '#6b7280'}20; color: ${lead.status?.color || '#6b7280'};">
                                    ${lead.status?.name || 'Sem status'}
                                </span>
                            </td>
                            <td>${new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">Nenhum lead encontrado</td></tr>'}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
