
export type UserRole = 'super-admin' | 'admin' | 'team' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  // Branch-specific fields
  branchId?: string;
  branchName?: string;
  // Team role specialization
  teamRole?: 'manager' | 'staff' | 'trainer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
