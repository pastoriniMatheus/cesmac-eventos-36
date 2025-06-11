
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const { event_id } = await req.json();

    if (!event_id) {
      return new Response('Missing event_id', { 
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

    if (eventError) {
      console.error('Erro ao buscar evento:', eventError);
      return new Response('Event not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Buscar leads do evento
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
      return new Response('Error fetching leads', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Buscar configurações do sistema (para logo)
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*');

    const logoUrl = settings?.find(s => s.key === 'company_logo')?.value || '';
    const companyName = settings?.find(s => s.key === 'company_name')?.value || 'CESMAC';

    // Estatísticas
    const totalLeads = leads?.length || 0;
    const leadsByStatus = {};
    const leadsByCourse = {};
    const leadsByShift = {};

    leads?.forEach(lead => {
      // Por status
      const statusName = lead.status?.name || 'Sem status';
      leadsByStatus[statusName] = (leadsByStatus[statusName] || 0) + 1;

      // Por curso
      const courseName = lead.course?.name || 'Sem curso';
      leadsByCourse[courseName] = (leadsByCourse[courseName] || 0) + 1;

      // Por turno
      const shift = lead.shift || 'Não informado';
      leadsByShift[shift] = (leadsByShift[shift] || 0) + 1;
    });

    // Gerar HTML do relatório
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Evento - ${event.name}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                max-height: 60px;
                max-width: 200px;
            }
            .company-info {
                text-align: right;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin: 0;
            }
            .report-date {
                color: #666;
                font-size: 14px;
            }
            .title {
                color: #2563eb;
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                margin: 30px 0;
            }
            .event-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #2563eb;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                border-top: 3px solid #2563eb;
            }
            .stat-number {
                font-size: 36px;
                font-weight: bold;
                color: #2563eb;
                margin: 10px 0;
            }
            .stat-label {
                color: #666;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .section {
                margin: 40px 0;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .table th {
                background: #2563eb;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }
            .table td {
                padding: 12px 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            .table tr:hover {
                background: #f8fafc;
            }
            .status-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
            .breakdown {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .breakdown-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .breakdown-title {
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 15px;
            }
            .breakdown-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .breakdown-item:last-child {
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
            </div>
            <div class="company-info">
                <h1 class="company-name">${companyName}</h1>
                <div class="report-date">Relatório gerado em ${new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
            </div>
        </div>

        <h1 class="title">Relatório de Leads por Evento</h1>

        <div class="event-info">
            <h2 style="margin: 0 0 10px 0; color: #1e40af;">📅 ${event.name}</h2>
            <p style="margin: 5px 0;"><strong>WhatsApp:</strong> ${event.whatsapp_number}</p>
            <p style="margin: 5px 0;"><strong>Criado em:</strong> ${new Date(event.created_at).toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalLeads}</div>
                <div class="stat-label">Total de Leads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(leadsByCourse).length}</div>
                <div class="stat-label">Cursos de Interesse</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(leadsByStatus).length}</div>
                <div class="stat-label">Status Diferentes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(leadsByShift).length}</div>
                <div class="stat-label">Turnos</div>
            </div>
        </div>

        <div class="breakdown">
            <div class="breakdown-card">
                <div class="breakdown-title">📊 Leads por Status</div>
                ${Object.entries(leadsByStatus).map(([status, count]) => 
                  `<div class="breakdown-item">
                    <span>${status}</span>
                    <span style="font-weight: bold;">${count}</span>
                  </div>`
                ).join('')}
            </div>

            <div class="breakdown-card">
                <div class="breakdown-title">🎓 Leads por Curso</div>
                ${Object.entries(leadsByCourse).map(([course, count]) => 
                  `<div class="breakdown-item">
                    <span>${course}</span>
                    <span style="font-weight: bold;">${count}</span>
                  </div>`
                ).join('')}
            </div>

            <div class="breakdown-card">
                <div class="breakdown-title">🕒 Leads por Turno</div>
                ${Object.entries(leadsByShift).map(([shift, count]) => 
                  `<div class="breakdown-item">
                    <span>${shift}</span>
                    <span style="font-weight: bold;">${count}</span>
                  </div>`
                ).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📋 Lista Detalhada de Leads</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>WhatsApp</th>
                        <th>Curso</th>
                        <th>Status</th>
                        <th>Turno</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads?.map(lead => `
                        <tr>
                            <td><strong>${lead.name}</strong></td>
                            <td>${lead.email}</td>
                            <td>${lead.whatsapp}</td>
                            <td>${lead.course?.name || '-'}</td>
                            <td>
                                <span class="status-badge" style="background-color: ${lead.status?.color || '#64748b'}20; color: ${lead.status?.color || '#64748b'};">
                                    ${lead.status?.name || 'Sem status'}
                                </span>
                            </td>
                            <td>${lead.shift || '-'}</td>
                            <td>${new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum lead encontrado para este evento</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema ${companyName}</p>
            <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    </body>
    </html>
    `;

    // Converter HTML para PDF usando puppeteer
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    await browser.close();

    return new Response(pdf, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${event.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf"`
      },
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
