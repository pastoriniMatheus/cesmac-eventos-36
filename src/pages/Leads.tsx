
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourses, useLeadStatuses, useEvents, useLeads } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const Leads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses = [] } = useCourses();
  const { data: leadStatuses = [] } = useLeadStatuses();
  const { data: events = [] } = useEvents();
  const { data: leads = [] } = useLeads();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const [newLead, setNewLead] = useState({
    name: '',
    whatsapp: '',
    email: '',
    course_id: '',
    event_id: '',
    status_id: '',
    shift: ''
  });

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.whatsapp || !newLead.email || !newLead.course_id || !newLead.event_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          ...newLead,
          status_id: newLead.status_id || leadStatuses[0]?.id
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setNewLead({
        name: '',
        whatsapp: '',
        email: '',
        course_id: '',
        event_id: '',
        status_id: '',
        shift: ''
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Lead adicionado",
        description: "Lead adicionado com sucesso ao sistema.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar lead",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (leadId: string, newStatusId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status_id: newStatusId })
        .eq('id', leadId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: "Status atualizado",
        description: "Status do lead atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.whatsapp.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status_id === statusFilter;
    const matchesEvent = eventFilter === 'all' || lead.event_id === eventFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Leads</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Lead</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
                <DialogDescription>
                  Preencha as informações do lead para adicionar ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome*</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp*</Label>
                  <Input
                    id="whatsapp"
                    value={newLead.whatsapp}
                    onChange={(e) => setNewLead({...newLead, whatsapp: e.target.value})}
                    placeholder="82999887766"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course">Curso*</Label>
                  <Select value={newLead.course_id} onValueChange={(value) => setNewLead({...newLead, course_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select value={newLead.shift} onValueChange={(value) => setNewLead({...newLead, shift: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manhã">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event">Evento*</Label>
                  <Select value={newLead.event_id} onValueChange={(value) => setNewLead({...newLead, event_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddLead}>
                  Adicionar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, email ou WhatsApp"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {leadStatuses.map((status: any) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-filter">Evento</Label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  {events.map((event: any) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setEventFilter('all');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Lista de todos os leads capturados nos eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.course?.name}</TableCell>
                  <TableCell>{lead.shift || '-'}</TableCell>
                  <TableCell>{lead.event?.name}</TableCell>
                  <TableCell>
                    <Select
                      value={lead.status_id || ''}
                      onValueChange={(value) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStatuses.map((status: any) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: status.color }}
                              />
                              <span>{status.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
