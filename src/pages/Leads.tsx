import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import { useLeads, useLeadStatuses, useDeleteMultipleLeads, useUpdateMultipleLeadsEvent } from '@/hooks/useLeads';
import { usePostgraduateCourses } from '@/hooks/usePostgraduateCourses';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import StatusEditor from '@/components/StatusEditor';
import { exportLeadsToCSV } from '@/utils/csvExport';
import { BookOpen, GraduationCap } from 'lucide-react';
import ContactExporter from '@/components/ContactExporter';

const Leads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: leads = [] } = useLeads();
  const { data: courses = [] } = useCourses();
  const { data: events = [] } = useEvents();
  const { data: leadStatuses = [] } = useLeadStatuses();
  const { data: postgraduateCourses = [] } = usePostgraduateCourses();
  const deleteMultipleLeads = useDeleteMultipleLeads();
  const updateMultipleLeadsEvent = useUpdateMultipleLeadsEvent();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkEditEventDialogOpen, setIsBulkEditEventDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkEventId, setBulkEventId] = useState<string>('none');
  
  const [newLead, setNewLead] = useState({
    name: '',
    whatsapp: '',
    email: '',
    course_type: 'course',
    course_id: '',
    postgraduate_course_id: '',
    event_id: '',
    status_id: '',
    shift: ''
  });

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.whatsapp || !newLead.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const leadData = {
        name: newLead.name,
        whatsapp: newLead.whatsapp.replace(/\D/g, ''),
        email: newLead.email.toLowerCase(),
        course_type: newLead.course_type,
        course_id: newLead.course_type === 'course' ? (newLead.course_id || null) : null,
        postgraduate_course_id: newLead.course_type === 'postgraduate' ? (newLead.postgraduate_course_id || null) : null,
        event_id: newLead.event_id === 'none' ? null : newLead.event_id,
        status_id: newLead.status_id === 'none' ? leadStatuses[0]?.id : newLead.status_id,
        shift: newLead.shift === 'none' ? null : newLead.shift
      };

      const { error } = await supabase
        .from('leads')
        .insert([leadData]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setNewLead({
        name: '',
        whatsapp: '',
        email: '',
        course_type: 'course',
        course_id: 'none',
        postgraduate_course_id: 'none',
        event_id: 'none',
        status_id: 'none',
        shift: 'none'
      });
      setIsCreateDialogOpen(false);

      toast({
        title: "Lead criado",
        description: "Lead criado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar lead",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = async () => {
    if (!editingLead) return;

    try {
      const updateData = {
        name: editingLead.name,
        whatsapp: editingLead.whatsapp.replace(/\D/g, ''),
        email: editingLead.email.toLowerCase(),
        course_type: editingLead.course_type,
        course_id: editingLead.course_type === 'course' ? (editingLead.course_id === 'none' ? null : editingLead.course_id) : null,
        postgraduate_course_id: editingLead.course_type === 'postgraduate' ? (editingLead.postgraduate_course_id === 'none' ? null : editingLead.postgraduate_course_id) : null,
        event_id: editingLead.event_id === 'none' ? null : editingLead.event_id,
        status_id: editingLead.status_id === 'none' ? null : editingLead.status_id,
        shift: editingLead.shift === 'none' ? null : editingLead.shift
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', editingLead.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditDialogOpen(false);
      setEditingLead(null);

      toast({
        title: "Lead atualizado",
        description: "Lead atualizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: "Lead removido",
        description: "Lead removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover lead",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência.`,
      });
    });
  };

  const openEditDialog = (lead: any) => {
    setEditingLead({
      ...lead,
      course_type: lead.course_type || 'course',
      course_id: lead.course_id || 'none',
      postgraduate_course_id: lead.postgraduate_course_id || 'none',
      event_id: lead.event_id || 'none',
      status_id: lead.status_id || (leadStatuses[0]?.id || 'none'),
      shift: lead.shift || 'none'
    });
    setIsEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    exportLeadsToCSV(filteredLeads);
    toast({
      title: "Exportação concluída",
      description: "Os leads foram exportados para CSV com sucesso!",
    });
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleSelectLeadsWithoutEvent = () => {
    const leadsWithoutEvent = filteredLeads.filter((lead: any) => !lead.event_id);
    setSelectedLeads(leadsWithoutEvent.map(lead => lead.id));
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteMultipleLeads.mutateAsync(selectedLeads);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Erro ao deletar leads:', error);
    }
  };

  const handleBulkEditEvent = async () => {
    try {
      const eventId = bulkEventId === 'none' ? null : bulkEventId;
      await updateMultipleLeadsEvent.mutateAsync({ leadIds: selectedLeads, eventId });
      setSelectedLeads([]);
      setIsBulkEditEventDialogOpen(false);
      setBulkEventId('none');
    } catch (error) {
      console.error('Erro ao atualizar evento dos leads:', error);
    }
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm);
    
    const matchesCourse = filterCourse === 'all' || lead.course_id === filterCourse;
    const matchesStatus = filterStatus === 'all' || lead.status_id === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-blue-600">Gerenciamento de Leads</h1>
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedLeads.length} selecionado(s)
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsBulkEditEventDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Evento
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir {selectedLeads.length} lead(s) selecionado(s)? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <ContactExporter leads={leads} />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Novo Lead</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Lead</DialogTitle>
                <DialogDescription>
                  Adicione um novo lead ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome*</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp*</Label>
                  <Input
                    id="whatsapp"
                    value={newLead.whatsapp}
                    onChange={(e) => setNewLead({...newLead, whatsapp: e.target.value})}
                    placeholder="(82) 99999-9999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    placeholder="joao@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course_type">Tipo de interesse</Label>
                  <Select 
                    value={newLead.course_type} 
                    onValueChange={(value) => setNewLead({
                      ...newLead, 
                      course_type: value,
                      course_id: '',
                      postgraduate_course_id: ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso de Graduação</SelectItem>
                      <SelectItem value="postgraduate">Pós-graduação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newLead.course_type === 'course' && (
                  <div className="grid gap-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select 
                      value={newLead.course_id} 
                      onValueChange={(value) => setNewLead({...newLead, course_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {newLead.course_type === 'postgraduate' && (
                  <div className="grid gap-2">
                    <Label htmlFor="postgraduate">Pós-graduação</Label>
                    <Select 
                      value={newLead.postgraduate_course_id} 
                      onValueChange={(value) => setNewLead({...newLead, postgraduate_course_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pós-graduação" />
                      </SelectTrigger>
                      <SelectContent>
                        {postgraduateCourses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="event">Evento</Label>
                  <Select 
                    value={newLead.event_id} 
                    onValueChange={(value) => setNewLead({...newLead, event_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum evento</SelectItem>
                      {events.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select 
                    value={newLead.shift} 
                    onValueChange={(value) => setNewLead({...newLead, shift: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum turno</SelectItem>
                      <SelectItem value="manhã">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateLead} className="bg-blue-600 hover:bg-blue-700">
                  Criar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, email ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {leadStatuses.map((status: any) => (
                    <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exportação Rápida</Label>
              <Button variant="outline" className="w-full" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-600">Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Gerencie todos os leads do sistema
              </CardDescription>
            </div>
            <Button onClick={handleSelectLeadsWithoutEvent} variant="outline" size="sm">
              Selecionar sem evento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos os leads"
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>ID do Lead</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                        aria-label={`Selecionar lead ${lead.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {lead.id.slice(0, 8)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lead.id, 'ID do Lead')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{lead.whatsapp}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lead.whatsapp, 'WhatsApp')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="max-w-[200px] truncate">{lead.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(lead.email, 'E-mail')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {lead.course_type === 'course' && lead.course?.name && (
                          <>
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{lead.course.name}</span>
                          </>
                        )}
                        {lead.course_type === 'postgraduate' && lead.postgraduate_course?.name && (
                          <>
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                            <span>{lead.postgraduate_course.name}</span>
                          </>
                        )}
                        {!lead.course?.name && !lead.postgraduate_course?.name && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.event?.name ? (
                        <Badge variant="outline">{lead.event.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusEditor 
                        leadId={lead.id} 
                        currentStatus={lead.status} 
                      />
                    </TableCell>
                    <TableCell>
                      {lead.shift ? (
                        <Badge variant="secondary">
                          {lead.shift.charAt(0).toUpperCase() + lead.shift.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(lead)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize as informações do lead
            </DialogDescription>
          </DialogHeader>
          {editingLead && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome*</Label>
                <Input
                  id="edit-name"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-whatsapp">WhatsApp*</Label>
                <Input
                  id="edit-whatsapp"
                  value={editingLead.whatsapp}
                  onChange={(e) => setEditingLead({...editingLead, whatsapp: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">E-mail*</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-type">Tipo de interesse</Label>
                <Select 
                  value={editingLead.course_type} 
                  onValueChange={(value) => setEditingLead({
                    ...editingLead, 
                    course_type: value,
                    course_id: 'none',
                    postgraduate_course_id: 'none'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Curso de Graduação</SelectItem>
                    <SelectItem value="postgraduate">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingLead.course_type === 'course' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-course">Curso</Label>
                  <Select 
                    value={editingLead.course_id} 
                    onValueChange={(value) => setEditingLead({...editingLead, course_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum curso</SelectItem>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingLead.course_type === 'postgraduate' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-postgraduate">Pós-graduação</Label>
                  <Select 
                    value={editingLead.postgraduate_course_id} 
                    onValueChange={(value) => setEditingLead({...editingLead, postgraduate_course_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma pós-graduação</SelectItem>
                      {postgraduateCourses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-event">Evento</Label>
                <Select 
                  value={editingLead.event_id} 
                  onValueChange={(value) => setEditingLead({...editingLead, event_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum evento</SelectItem>
                      {events.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingLead.status_id} 
                  onValueChange={(value) => setEditingLead({...editingLead, status_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum status</SelectItem>
                    {leadStatuses.map((status: any) => (
                      <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-shift">Turno</Label>
                <Select 
                  value={editingLead.shift} 
                  onValueChange={(value) => setEditingLead({...editingLead, shift: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum turno</SelectItem>
                    <SelectItem value="manhã">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditLead} className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Event Dialog */}
      <Dialog open={isBulkEditEventDialogOpen} onOpenChange={setIsBulkEditEventDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Editar Evento em Massa</DialogTitle>
            <DialogDescription>
              Atualizar o evento de {selectedLeads.length} lead(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-event">Evento</Label>
              <Select 
                value={bulkEventId} 
                onValueChange={setBulkEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum evento</SelectItem>
                  {events.map((event: any) => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBulkEditEventDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkEditEvent} className="bg-blue-600 hover:bg-blue-700">
              Atualizar {selectedLeads.length} Lead(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Leads;