
import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

// Mock users for the 4-role system with branch assignments
const mockUsers: Record<UserRole, User[]> = {
  'super-admin': [{
    id: '0',
    email: 'superadmin@gymfit.com',
    name: 'David Thompson',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'System Administration',
    phone: '+1 (555) 000-0000',
    joinDate: '2022-01-01'
  }],
  admin: [{
    id: '1',
    email: 'admin@gymfit.com',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    department: 'Management',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15'
  }],
  team: [
    {
      id: '2',
      email: 'manager@gymfit.com',
      name: 'Robert Kim',
      role: 'team',
      teamRole: 'manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      department: 'Operations',
      phone: '+1 (555) 111-2222',
      joinDate: '2023-02-10',
      branchId: 'branch_1',
      branchName: 'Downtown Branch'
    },
    {
      id: '3',
      email: 'staff@gymfit.com',
      name: 'Lisa Chen',
      role: 'team',
      teamRole: 'staff',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      department: 'Front Desk',
      phone: '+1 (555) 222-3333',
      joinDate: '2023-04-15',
      branchId: 'branch_1',
      branchName: 'Downtown Branch'
    },
    {
      id: '4',
      email: 'trainer@gymfit.com',
      name: 'Mike Rodriguez',
      role: 'team',
      teamRole: 'trainer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      department: 'Personal Training',
      phone: '+1 (555) 234-5678',
      joinDate: '2023-03-20',
      branchId: 'branch_1',
      branchName: 'Downtown Branch'
    }
  ],
  member: [{
    id: '5',
    email: 'member@gymfit.com',
    name: 'Emily Chen',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 345-6789',
    joinDate: '2023-06-10',
    branchId: 'branch_1',
    branchName: 'Downtown Branch'
  }]
};

const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}>({
  authState: { user: null, isAuthenticated: false, isLoading: true },
  login: async () => {},
  logout: () => {}
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
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('gymfit_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        localStorage.removeItem('gymfit_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email and role
    const roleUsers = mockUsers[credentials.role];
    const user = roleUsers.find(u => u.email === credentials.email);
    
    if (user) {
      localStorage.setItem('gymfit_user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('gymfit_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
