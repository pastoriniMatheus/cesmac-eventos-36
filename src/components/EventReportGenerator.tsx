
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { useEvents, useLeads, useSystemSettings } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const EventReportGenerator = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();
  const { data: settings = [] } = useSystemSettings();
  const { toast } = useToast();

  const generatePDFReport = async () => {
    if (!selectedEvent) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um evento.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/generate-event-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnRxdWVicGNuemppc2Z0Y2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzcyNTMsImV4cCI6MjA2NTE1MzI1M30.GvPd5cEdgmAZG-Jsch66mdX24QNosV12Tz-F1Af93_0`
        },
        body: JSON.stringify({
          event_id: selectedEvent
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const htmlContent = await response.text();
      
      // Abrir nova janela com o relatório
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        // Aguardar um pouco e depois imprimir
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      }

      toast({
        title: "Relatório gerado",
        description: "O relatório foi aberto em uma nova janela. Use Ctrl+P para imprimir como PDF.",
      });

      setIsDialogOpen(false);
      setSelectedEvent('');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Relatório por Evento</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório de Evento</DialogTitle>
          <DialogDescription>
            Selecione um evento para gerar um relatório em PDF
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Evento</label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event: any) => {
                  const eventLeads = leads.filter(lead => lead.event_id === event.id);
                  return (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({eventLeads.length} leads)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={generatePDFReport} 
            disabled={isGenerating || !selectedEvent}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventReportGenerator;
