import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, loading, needsInstallation } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se o sistema precisa de instalação, redirecionar para /install
  if (needsInstallation && location.pathname !== '/install') {
    return <Navigate to="/install" replace />;
  }

  // Se não precisa de instalação mas está na página de install, redirecionar para login
  if (!needsInstallation && location.pathname === '/install') {
    return <Navigate to="/login" replace />;
  }

  // Se requer autenticação e não está logado
  if (requireAuth && !user) {
    // Salvar a rota atual para redirecionar depois do login
    const from = location.pathname + location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }

  // Se não requer autenticação mas está logado (ex: página de login)
  if (!requireAuth && user && (location.pathname === '/login' || location.pathname === '/install')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;