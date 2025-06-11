
export const exportLeadsToCSV = (leads: any[]) => {
  const headers = [
    'Nome',
    'E-mail', 
    'WhatsApp',
    'Curso',
    'Evento',
    'Status',
    'Turno',
    'Data de Criação'
  ];

  const csvData = leads.map(lead => [
    lead.name,
    lead.email,
    lead.whatsapp,
    lead.course?.name || '',
    lead.event?.name || '',
    lead.status?.name || '',
    lead.shift || '',
    new Date(lead.created_at).toLocaleDateString('pt-BR')
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field}"` 
          : field
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
