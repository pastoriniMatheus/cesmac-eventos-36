
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Plus, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeData {
  id: string;
  eventName: string;
  whatsappNumber: string;
  qrCodeUrl: string;
  waLink: string;
  createdAt: string;
  scans: number;
}

const QRCodePage = () => {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([
    {
      id: '1',
      eventName: 'Feira Estudante 23',
      whatsappNumber: '5582988898565',
      qrCodeUrl: 'data:image/png;base64,placeholder-qr-code',
      waLink: 'https://wa.me/5582988898565?text=Feira%20Estudante%2023',
      createdAt: '2024-06-01T10:00:00',
      scans: 45
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQRCode, setNewQRCode] = useState({
    eventName: '',
    whatsappNumber: ''
  });

  const generateQRCode = (whatsappNumber: string, eventName: string) => {
    // Gerar link do WhatsApp
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(eventName)}`;
    
    // Aqui você usaria uma biblioteca real de QR Code como qrcode
    // Por enquanto, simularemos com um placeholder
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink)}`;
    
    return { waLink, qrCodeUrl };
  };

  const handleCreateQRCode = () => {
    if (!newQRCode.eventName || !newQRCode.whatsappNumber) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato do WhatsApp
    const whatsappRegex = /^[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(newQRCode.whatsappNumber)) {
      toast({
        title: "Erro",
        description: "Número do WhatsApp inválido. Use apenas números (ex: 5582988898565).",
        variant: "destructive",
      });
      return;
    }

    const { waLink, qrCodeUrl } = generateQRCode(newQRCode.whatsappNumber, newQRCode.eventName);

    const qrCodeData: QRCodeData = {
      id: Date.now().toString(),
      eventName: newQRCode.eventName,
      whatsappNumber: newQRCode.whatsappNumber,
      qrCodeUrl,
      waLink,
      createdAt: new Date().toISOString(),
      scans: 0
    };

    setQrCodes([...qrCodes, qrCodeData]);
    setNewQRCode({ eventName: '', whatsappNumber: '' });
    setIsCreateDialogOpen(false);

    toast({
      title: "QR Code criado",
      description: `QR Code para o evento "${newQRCode.eventName}" foi criado com sucesso!`,
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência.`,
      });
    });
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    // Criar link de download
    const link = document.createElement('a');
    link.href = qrCode.qrCodeUrl;
    link.download = `qrcode-${qrCode.eventName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "QR Code sendo baixado...",
    });
  };

  const [previewQR, setPreviewQR] = useState<QRCodeData | null>(null);

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
                <TableHead>WhatsApp</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qrCode) => (
                <TableRow key={qrCode.id}>
                  <TableCell className="font-medium">{qrCode.eventName}</TableCell>
                  <TableCell className="font-mono">{qrCode.whatsappNumber}</TableCell>
                  <TableCell>
                    <img
                      src={qrCode.qrCodeUrl}
                      alt={`QR Code ${qrCode.eventName}`}
                      className="w-16 h-16 border rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded max-w-32 truncate">
                        {qrCode.waLink}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(qrCode.waLink, 'Link')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{qrCode.scans}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(qrCode.createdAt).toLocaleDateString('pt-BR')}
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
                        onClick={() => copyToClipboard(qrCode.waLink, 'Link')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Preview Dialog */}
      <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Preview - {previewQR?.eventName}</DialogTitle>
            <DialogDescription>
              QR Code para direcionamento ao WhatsApp
            </DialogDescription>
          </DialogHeader>
          {previewQR && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={previewQR.qrCodeUrl}
                  alt={`QR Code ${previewQR.eventName}`}
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Evento:</Label>
                  <p className="text-sm font-medium">{previewQR.eventName}</p>
                </div>
                <div>
                  <Label>WhatsApp:</Label>
                  <p className="text-sm font-mono">{previewQR.whatsappNumber}</p>
                </div>
                <div>
                  <Label>Link completo:</Label>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                      {previewQR.waLink}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(previewQR.waLink, 'Link')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Scans totais:</Label>
                    <p className="font-medium">{previewQR.scans}</p>
                  </div>
                  <div>
                    <Label>Criado em:</Label>
                    <p className="font-medium">
                      {new Date(previewQR.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => downloadQRCode(previewQR)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(previewQR.waLink, 'Link')}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex space-x-3">
            <Badge variant="outline">1</Badge>
            <p>Preencha o número do WhatsApp (com código do país) e o nome do evento</p>
          </div>
          <div className="flex space-x-3">
            <Badge variant="outline">2</Badge>
            <p>O sistema gerará automaticamente um QR Code que direciona para o WhatsApp</p>
          </div>
          <div className="flex space-x-3">
            <Badge variant="outline">3</Badge>
            <p>Quando escaneado, o QR Code abrirá uma conversa com o texto do evento pré-preenchido</p>
          </div>
          <div className="flex space-x-3">
            <Badge variant="outline">4</Badge>
            <p>Baixe ou copie o link para usar em materiais impressos ou digitais</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
