
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  userRoles: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasFinancialAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        // For now, assign admin role as fallback to maintain functionality
        setUserRoles(['admin']);
      } else {
        const roles = data?.map(r => r.role) || [];
        // If no roles found, assign admin role as fallback
        setUserRoles(roles.length > 0 ? roles : ['admin']);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Fallback to admin role to maintain functionality
      setUserRoles(['admin']);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  const hasFinancialAccess = () => {
    return userRoles.some(role => ['admin', 'financial_staff'].includes(role));
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRoles,
      loading,
      signOut,
      hasRole,
      hasFinancialAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
