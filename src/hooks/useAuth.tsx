
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}>({
  authState: { user: null, isAuthenticated: false, isLoading: true },
  login: async () => {},
  logout: () => {},
  signUp: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check initial auth state
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          branches!branch_id (
            name
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        id: profile.user_id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as UserRole,
        teamRole: profile.team_role,
        avatar: profile.avatar_url,
        phone: profile.phone,
        joinDate: profile.created_at?.split('T')[0],
        branchId: profile.branch_id,
        branchName: profile.branches?.[0]?.name
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;

      if (data.user) {
        const userData = await fetchUserProfile(data.user.id);
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error: any) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};
