
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  needsInstallation: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsInstallation, setNeedsInstallation] = useState(false);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('cesmac_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Validar se os dados do localStorage são válidos
        if (userData && userData.id && userData.username) {
          setUser(userData);
        } else {
          // Limpar dados inválidos
          localStorage.removeItem('cesmac_user');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('cesmac_user');
      }
    }
    
    // Verificar se o sistema precisa de instalação
    checkInstallationNeeded();
  }, []);

  const checkInstallationNeeded = async () => {
    try {
      // Tentar verificar se existem usuários no sistema
      const { data, error } = await supabase
        .from('authorized_users')
        .select('id')
        .limit(1);

      if (error) {
        // Se há erro (tabela não existe, etc), precisa de instalação
        console.log('Tabela não existe ou erro de conexão:', error);
        setNeedsInstallation(true);
      } else if (!data || data.length === 0) {
        // Tabela existe mas está vazia - precisa de instalação
        console.log('Sistema sem usuários, precisa de instalação');
        setNeedsInstallation(true);
      } else {
        // Há usuários, sistema já instalado
        console.log('Sistema já instalado');
        setNeedsInstallation(false);
      }
    } catch (err) {
      // Em caso de erro, assumir que precisa de instalação
      console.log('Erro ao verificar instalação:', err);
      setNeedsInstallation(true);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('Tentando fazer login:', username);
      
      // Validação de input para prevenir ataques
      if (!username || !password) {
        return { success: false, error: 'Usuário e senha são obrigatórios' };
      }
      
      if (username.length < 3 || password.length < 6) {
        return { success: false, error: 'Credenciais inválidas' };
      }
      
      // Verificar se existe a função RPC
      const { data, error } = await supabase
        .rpc('verify_login', {
          p_username: username.trim().toLowerCase(), // Normalizar input
          p_password: password
        });

      if (error) {
        console.error('Erro na verificação:', error);
        // Não expor detalhes do erro interno por segurança
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (data && data.length > 0 && data[0].success) {
        const userData = data[0].user_data as unknown as User;
        
        // Validar se os dados retornados são válidos
        if (!userData || !userData.id || !userData.username) {
          return { success: false, error: 'Dados do usuário inválidos' };
        }
        
        setUser(userData);
        
        // Armazenar com dados mínimos no localStorage (não armazenar senhas ou dados sensíveis)
        const safeUserData = {
          id: userData.id,
          username: userData.username,
          email: userData.email
        };
        localStorage.setItem('cesmac_user', JSON.stringify(safeUserData));
        
        return { success: true };
      } else {
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // Não expor detalhes técnicos por segurança
      return { success: false, error: 'Erro de autenticação' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cesmac_user');
    
    // Limpar outros dados sensíveis que possam estar no localStorage
    const keysToRemove = ['form_tracking_id', 'form_event_name', 'scan_session_id'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Opcional: Limpar sessionStorage também
    sessionStorage.clear();
  };

  return {
    user,
    login,
    logout,
    loading,
    needsInstallation
  };
};

export { AuthContext };
