import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Database, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseInstallerProps {
  className?: string;
}

const DatabaseInstaller: React.FC<DatabaseInstallerProps> = ({ className }) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [useCustomConnection, setUseCustomConnection] = useState(false);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    setIsChecking(true);
    try {
      // Tentar uma query simples para verificar conexão
      const { data, error } = await supabase
        .from('system_settings')
        .select('count')
        .limit(1)
        .single();

      if (!error || error.code === 'PGRST116') {
        // PGRST116 = No rows found, mas conexão ok
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const installDatabase = async () => {
    setIsInstalling(true);
    setInstallProgress(0);

    try {
      // Buscar o SQL de estrutura
      setInstallProgress(20);
      const response = await fetch('/database-structure.sql');
      const sqlContent = await response.text();

      setInstallProgress(40);

      // Dividir em comandos
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      setInstallProgress(60);

      // Executar comandos em lotes
      let successCount = 0;
      const totalCommands = commands.length;

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        try {
          if (command.toUpperCase().includes('CREATE') || 
              command.toUpperCase().includes('ALTER') ||
              command.toUpperCase().includes('INSERT')) {
            
            await supabase.rpc('execute_sql', { sql_query: command });
            successCount++;
          }
        } catch (cmdError) {
          console.warn(`Comando ignorado (pode já existir): ${command.substring(0, 50)}...`);
        }

        // Atualizar progresso
        setInstallProgress(60 + (i / totalCommands) * 35);
      }

      setInstallProgress(95);

      // Criar usuário admin padrão
      const defaultPassword = 'admin123';
      await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO public.authorized_users (username, email, password_hash)
          VALUES ('admin', 'admin@sistema.com', crypt('${defaultPassword}', gen_salt('bf')))
          ON CONFLICT (username) DO NOTHING;
        `
      });

      setInstallProgress(100);

      toast({
        title: "Instalação concluída!",
        description: `Banco instalado com sucesso. ${successCount} comandos executados.`,
      });

      // Recheck connection
      setTimeout(() => {
        checkDatabaseConnection();
      }, 1000);

    } catch (error: any) {
      console.error('Erro na instalação:', error);
      toast({
        title: "Erro na instalação",
        description: error.message || "Erro ao instalar banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
      setInstallProgress(0);
    }
  };

  if (isChecking) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Verificando conexão com banco de dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-600">Banco de Dados Conectado</CardTitle>
          </div>
          <CardDescription>
            Sistema conectado com sucesso ao Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              O banco de dados está funcionando normalmente. Todas as funcionalidades estão disponíveis.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button onClick={checkDatabaseConnection} variant="outline" size="sm">
              Verificar conexão novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-600">Banco de Dados não Detectado</CardTitle>
          </div>
          <CardDescription>
            Não foi possível conectar ao banco de dados. Execute a instalação abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para usar este sistema, você precisa de um banco de dados configurado. 
              Use a instalação automática ou configure manualmente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Instalação Automática */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Instalação Automática (Recomendada)</CardTitle>
          </div>
          <CardDescription>
            Instalar estrutura completa do banco de dados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">O que será instalado:</p>
              <ul className="space-y-1 text-xs">
                <li>• Todas as tabelas necessárias (leads, courses, events, etc.)</li>
                <li>• Índices otimizados para performance</li>
                <li>• Funções e triggers automáticos</li>
                <li>• Políticas de segurança (RLS)</li>
                <li>• Usuário admin padrão (admin/admin123)</li>
              </ul>
            </div>
          </div>

          {isInstalling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Instalando banco de dados...</span>
                <span>{Math.round(installProgress)}%</span>
              </div>
              <Progress value={installProgress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={installDatabase} 
            disabled={isInstalling}
            className="w-full"
            size="lg"
          >
            {isInstalling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Instalar Banco de Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Configuração Manual */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Configuração Manual</CardTitle>
          </div>
          <CardDescription>
            Se você possui seu próprio banco Supabase, configure as credenciais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta opção é para usuários avançados. Você precisará modificar o arquivo de configuração do Supabase.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-url">URL do Supabase</Label>
              <Input
                id="custom-url"
                type="url"
                placeholder="https://xxxx.supabase.co"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="custom-key">Chave Anônima</Label>
              <Input
                id="custom-key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Após configurar as credenciais, você precisará executar 
                o SQL de estrutura manualmente no seu banco de dados.
              </p>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Configurar (Em desenvolvimento)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseInstaller;