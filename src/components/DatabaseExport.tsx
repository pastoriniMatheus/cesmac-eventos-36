
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Database, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseExportProps {
  className?: string;
}

const DatabaseExport: React.FC<DatabaseExportProps> = ({ className }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    host: 'dobtquebpcnzjisftcfh.supabase.co',
    port: '5432',
    database: 'postgres',
    username: 'postgres',
    password: '',
    schema: 'public'
  });

  const handleExportDatabase = async () => {
    if (!exportConfig.password.trim()) {
      toast({
        title: "Senha necessária",
        description: "Por favor, preencha a senha do banco de dados para executar o dump.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      console.log('🚀 Iniciando exportação do banco de dados...');
      
      // Usar Edge Function para executar o dump
      const { data, error } = await supabase.functions.invoke('database-export', {
        body: {
          host: exportConfig.host,
          port: parseInt(exportConfig.port),
          database: exportConfig.database,
          username: exportConfig.username,
          password: exportConfig.password,
          schema: exportConfig.schema
        }
      });

      if (error) {
        console.error('❌ Erro na exportação:', error);
        throw new Error(error.message || 'Erro ao exportar banco de dados');
      }

      // Criar arquivo de download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database_dump_${timestamp}.sql`;
      
      const blob = new Blob([data.dump], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: `Banco de dados exportado com sucesso! Arquivo: ${filename}`,
      });

    } catch (error: any) {
      console.error('💥 Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Erro ao exportar banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <CardTitle>Exportar Banco de Dados</CardTitle>
        </div>
        <CardDescription>
          Execute um dump completo do banco de dados para backup ou migração
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informações de Conexão</p>
              <p>Use estas informações para importar o banco em outro servidor:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Host: {exportConfig.host}</li>
                <li>• Porta: {exportConfig.port}</li>
                <li>• Database: {exportConfig.database}</li>
                <li>• Schema: {exportConfig.schema}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={exportConfig.host}
              onChange={(e) => setExportConfig({...exportConfig, host: e.target.value})}
              placeholder="host.supabase.co"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Porta</Label>
            <Input
              id="port"
              value={exportConfig.port}
              onChange={(e) => setExportConfig({...exportConfig, port: e.target.value})}
              placeholder="5432"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              value={exportConfig.database}
              onChange={(e) => setExportConfig({...exportConfig, database: e.target.value})}
              placeholder="postgres"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={exportConfig.username}
              onChange={(e) => setExportConfig({...exportConfig, username: e.target.value})}
              placeholder="postgres"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha do Banco *</Label>
          <Input
            id="password"
            type="password"
            value={exportConfig.password}
            onChange={(e) => setExportConfig({...exportConfig, password: e.target.value})}
            placeholder="Digite a senha do banco de dados"
          />
          <p className="text-xs text-muted-foreground">
            Esta senha não será salva e é usada apenas para a exportação
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schema">Schema</Label>
          <Input
            id="schema"
            value={exportConfig.schema}
            onChange={(e) => setExportConfig({...exportConfig, schema: e.target.value})}
            placeholder="public"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Comando para Importar</p>
            <p className="mb-2">Para importar o dump em outro banco PostgreSQL, use:</p>
            <Textarea
              readOnly
              value={`psql -h [HOST] -p [PORT] -U [USERNAME] -d [DATABASE] -f database_dump_[TIMESTAMP].sql`}
              className="font-mono text-xs bg-amber-100 border-amber-300"
              rows={2}
            />
            <p className="mt-2 text-xs">
              Substitua os valores entre colchetes pelas informações do banco de destino
            </p>
          </div>
        </div>

        <Button 
          onClick={handleExportDatabase} 
          disabled={isExporting || !exportConfig.password.trim()}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Baixar Dump do Banco'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseExport;
