import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, AlertTriangle } from 'lucide-react';
import DatabaseInstaller from '@/components/DatabaseInstaller';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const navigate = useNavigate();
  const [showInstaller, setShowInstaller] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {!showInstaller ? (
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                  <Database className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Sistema de Captação de Leads</CardTitle>
              <CardDescription className="text-lg">
                Bem-vindo! Configure o sistema para começar a usar.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Primeira instalação detectada!</strong><br />
                  Para usar o sistema, você precisa instalar e configurar o banco de dados.
                  Este processo criará todas as tabelas necessárias e um usuário administrador padrão.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3">O que será configurado:</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Banco de dados completo com todas as tabelas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Sistema de leads, cursos e eventos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    QR codes e captação de leads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Usuário administrador (admin/admin123)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Configurações e webhooks
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Credenciais padrão após instalação:</strong><br />
                  Usuário: <code className="bg-amber-100 px-1 rounded">admin</code><br />
                  Senha: <code className="bg-amber-100 px-1 rounded">admin123</code>
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowInstaller(true)}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  size="lg"
                >
                  <Database className="h-5 w-5 mr-2" />
                  Instalar Sistema
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Já tenho acesso
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Instalação do Sistema
                </CardTitle>
                <CardDescription>
                  Configure o banco de dados e crie o usuário administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseInstaller isPublicInstall={true} />
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => setShowInstaller(false)}
              >
                ← Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Install;