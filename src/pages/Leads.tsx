
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  course: string;
  event: string;
  status: 'pendente' | 'em_atendimento' | 'inscrito' | 'matriculado' | 'ingressou_outra_faculdade';
  createdAt: string;
}

const Leads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'João Silva',
      whatsapp: '82999887766',
      email: 'joao@email.com',
      course: 'Medicina',
      event: 'Feira Estudante 23',
      status: 'pendente',
      createdAt: '2024-06-08T10:30:00'
    },
    {
      id: '2',
      name: 'Maria Santos',
      whatsapp: '82988776655',
      email: 'maria@email.com',
      course: 'Engenharia',
      event: 'Open Day CESMAC',
      status: 'em_atendimento',
      createdAt: '2024-06-08T11:15:00'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const [newLead, setNewLead] = useState({
    name: '',
    whatsapp: '',
    email: '',
    course: '',
    event: '',
    status: 'pendente' as const
  });

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-500' },
    { value: 'em_atendimento', label: 'Em Atendimento', color: 'bg-blue-500' },
    { value: 'inscrito', label: 'Inscrito', color: 'bg-green-500' },
    { value: 'matriculado', label: 'Matriculado', color: 'bg-purple-500' },
    { value: 'ingressou_outra_faculdade', label: 'Ingressou Outra Faculdade', color: 'bg-red-500' }
  ];

  const events = ['Feira Estudante 23', 'Open Day CESMAC', 'Workshop TI', 'Palestra Medicina'];
  const courses = ['Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia'];

  const handleAddLead = () => {
    if (!newLead.name || !newLead.whatsapp || !newLead.email || !newLead.course || !newLead.event) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const lead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      createdAt: new Date().toISOString()
    };

    setLeads([...leads, lead]);
    setNewLead({
      name: '',
      whatsapp: '',
      email: '',
      course: '',
      event: '',
      status: 'pendente'
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Lead adicionado",
      description: "Lead adicionado com sucesso ao sistema.",
    });
  };

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));

    toast({
      title: "Status atualizado",
      description: "Status do lead atualizado com sucesso.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Upload iniciado",
        description: "Processando arquivo de leads...",
      });
      // Implementar lógica de upload e parsing do CSV/TXT
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.whatsapp.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || lead.event === eventFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge variant="secondary" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Leads</h1>
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Importar CSV/TXT</span>
            </Button>
          </Label>
          
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
                  <Select value={newLead.course} onValueChange={(value) => setNewLead({...newLead, course: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event">Evento*</Label>
                  <Select value={newLead.event} onValueChange={(value) => setNewLead({...newLead, event: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event} value={event}>{event}</SelectItem>
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                  {events.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
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
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.course}</TableCell>
                  <TableCell>{lead.event}</TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value: Lead['status']) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
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
