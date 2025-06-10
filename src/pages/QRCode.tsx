
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Plus, Copy, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQRCodes } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { generateShortUrl, buildWhatsAppUrl } from '@/utils/urlShortener';

const QRCodePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: qrCodes = [] } = useQRCodes();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQRCode, setNewQRCode] = useState({
    eventName: '',
    whatsappNumber: ''
  });
  const [previewQR, setPreviewQR] = useState<any>(null);

  const generateQRCode = (whatsappNumber: string, eventName: string) => {
    const waLink = buildWhatsAppUrl(whatsappNumber, eventName);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink)}`;
    
    return { waLink, qrCodeUrl };
  };

  const handleCreateQRCode = async () => {
    if (!newQRCode.eventName || !newQRCode.whatsappNumber) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const whatsappRegex = /^[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(newQRCode.whatsappNumber)) {
      toast({
        title: "Erro",
        description: "Número do WhatsApp inválido. Use apenas números (ex: 5582988898565).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Primeiro criar o evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          name: newQRCode.eventName,
          whatsapp_number: newQRCode.whatsappNumber
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Depois criar o QR code
      const { waLink } = generateQRCode(newQRCode.whatsappNumber, newQRCode.eventName);
      const shortUrl = generateShortUrl();

      const { error: qrError } = await supabase
        .from('qr_codes')
        .insert([{
          event_id: event.id,
          short_url: shortUrl,
          original_url: waLink
        }]);

      if (qrError) throw qrError;

      queryClient.invalidateQueries({ queryKey: ['qr_codes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      setNewQRCode({ eventName: '', whatsappNumber: '' });
      setIsCreateDialogOpen(false);

      toast({
        title: "QR Code criado",
        description: `QR Code para o evento "${newQRCode.eventName}" foi criado com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar QR Code",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQRCode = async (qrCodeId: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrCodeId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['qr_codes'] });

      toast({
        title: "QR Code removido",
        description: "QR Code removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover QR Code",
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

  const downloadQRCode = (qrCode: any) => {
    const shortUrl = `${window.location.origin}/r/${qrCode.short_url}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shortUrl)}`;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${qrCode.event?.name?.replace(/\s+/g, '-').toLowerCase() || 'qrcode'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "QR Code sendo baixado...",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gerador de QR Code</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo QR Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo QR Code</DialogTitle>
              <DialogDescription>
                Gere um QR Code que direciona para uma conversa do WhatsApp com texto pré-definido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Número do WhatsApp*</Label>
                <Input
                  id="whatsapp"
                  value={newQRCode.whatsappNumber}
                  onChange={(e) => setNewQRCode({...newQRCode, whatsappNumber: e.target.value})}
                  placeholder="5582988898565"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: código do país + DDD + número (sem espaços ou símbolos)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event">Nome do Evento/Palavra-chave*</Label>
                <Input
                  id="event"
                  value={newQRCode.eventName}
                  onChange={(e) => setNewQRCode({...newQRCode, eventName: e.target.value})}
                  placeholder="Feira Estudante 23"
                />
                <p className="text-xs text-muted-foreground">
                  Este texto aparecerá automaticamente na conversa do WhatsApp
                </p>
              </div>
              {newQRCode.whatsappNumber && newQRCode.eventName && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <Label>Preview do Link:</Label>
                  <p className="text-sm font-mono mt-1 break-all">
                    wa.me/{newQRCode.whatsappNumber}?text={encodeURIComponent(newQRCode.eventName)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQRCode}>
                Criar QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>QR Codes Gerados</CardTitle>
          <CardDescription>
            Gerencie todos os QR Codes criados para seus eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>ID do Evento</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Link Curto</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qrCode: any) => {
                const shortUrl = `${window.location.origin}/r/${qrCode.short_url}`;
                return (
                  <TableRow key={qrCode.id}>
                    <TableCell className="font-medium">{qrCode.event?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {qrCode.event_id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(qrCode.event_id, 'ID do Evento')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{qrCode.event?.whatsapp_number}</TableCell>
                    <TableCell>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(shortUrl)}`}
                        alt={`QR Code ${qrCode.event?.name}`}
                        className="w-16 h-16 border rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /r/{qrCode.short_url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(shortUrl, 'Link encurtado')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{qrCode.scans}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(qrCode.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewQR(qrCode)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadQRCode(qrCode)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQRCode(qrCode.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {qrCodes.length === 0 && (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum QR Code criado ainda. Clique em "Novo QR Code" para começar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog - Layout Melhorado */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg">{previewQR?.event?.name}</DialogTitle>
            <DialogDescription>
              Preview do QR Code para direcionamento ao WhatsApp
            </DialogDescription>
          </DialogHeader>
          {previewQR && (
            <div className="space-y-4">
              {/* QR Code centralizado e menor */}
              <div className="flex justify-center py-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/r/${previewQR.short_url}`)}`}
                  alt={`QR Code ${previewQR.event?.name}`}
                  className="w-48 h-48 border rounded-lg shadow-sm"
                />
              </div>
              
              {/* Grid de informações mais compacto */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">ID do Evento</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                      {previewQR.event_id}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(previewQR.event_id, 'ID do Evento')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">WhatsApp</Label>
                  <p className="text-sm font-mono mt-1">{previewQR.event?.whatsapp_number}</p>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Scans</Label>
                  <p className="text-sm font-medium mt-1">{previewQR.scans}</p>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Link Encurtado</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                      {window.location.origin}/r/{previewQR.short_url}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(`${window.location.origin}/r/${previewQR.short_url}`, 'Link encurtado')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Criado em</Label>
                  <p className="text-sm mt-1">
                    {new Date(previewQR.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {/* Botões de ação mais compactos */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => downloadQRCode(previewQR)}
                  className="flex-1 h-9"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${window.location.origin}/r/${previewQR.short_url}`, 'Link encurtado')}
                  className="flex-1 h-9"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCodePage;
