
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permission, RoleDefinition, UserWithRoles, AuditLog, type RBACContext as RBACContextType } from '@/types/rbac';
import { useAuth } from './useAuth';

// Mock roles with comprehensive permissions
const mockRoles: Record<string, RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    color: '#dc2626',
    isSystem: true,
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.export',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
      'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
      'classes.view', 'classes.create', 'classes.edit', 'classes.delete', 'classes.schedule',
      'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
      'billing.view', 'billing.create', 'billing.edit', 'billing.process',
      'analytics.view', 'reports.view', 'reports.export',
      'settings.view', 'settings.edit', 'system.backup', 'system.restore',
      'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
      'notifications.view', 'notifications.send',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process', 'referrals.export',
      'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.delete', 'feedback.respond', 'feedback.export',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'admin': {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    color: '#ea580c',
    isSystem: true,
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.export',
      'roles.view',
      'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
      'staff.view', 'staff.create', 'staff.edit',
      'classes.view', 'classes.create', 'classes.edit', 'classes.delete', 'classes.schedule',
      'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
      'billing.view', 'billing.create', 'billing.edit', 'billing.process',
      'analytics.view', 'reports.view', 'reports.export',
      'settings.view', 'settings.edit',
      'branches.view',
      'notifications.view', 'notifications.send',
      'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process', 'referrals.export',
      'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.respond', 'feedback.export',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'manager': {
    id: 'manager',
    name: 'Manager',
    description: 'Management access with operational permissions',
    color: '#2563eb',
    isSystem: true,
    permissions: [
      'users.view',
      'members.view', 'members.create', 'members.edit', 'members.export',
      'staff.view',
      'classes.view', 'classes.create', 'classes.edit', 'classes.schedule',
      'equipment.view', 'equipment.edit',
      'billing.view', 'billing.edit',
      'analytics.view', 'reports.view',
      'branches.view',
      'notifications.view', 'notifications.send',
      'leads.view', 'leads.edit', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.edit', 'referrals.process',
      'feedback.view', 'feedback.respond',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'trainer': {
    id: 'trainer',
    name: 'Personal Trainer',
    description: 'Trainer access for classes and member interaction',
    color: '#059669',
    isSystem: true,
    permissions: [
      'members.view',
      'classes.view', 'classes.edit', 'classes.schedule',
      'equipment.view',
      'notifications.view',
      'leads.view', 'leads.edit',
      'tasks.view', 'tasks.edit'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'member': {
    id: 'member',
    name: 'Member',
    description: 'Basic member access',
    color: '#7c3aed',
    isSystem: true,
    permissions: [
      'classes.view',
      'equipment.view',
      'billing.view',
      'feedback.create',
      'referrals.view', 'referrals.create'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
};

// Mock users with enhanced RBAC data
const mockUsersWithRoles: Record<string, UserWithRoles> = {
  'admin@gymfit.com': {
    id: '1',
    email: 'admin@gymfit.com',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    department: 'Management',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    roles: [mockRoles['super-admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'system'
  },
  'trainer@gymfit.com': {
    id: '2',
    email: 'trainer@gymfit.com',
    name: 'Mike Rodriguez',
    role: 'trainer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    department: 'Personal Training',
    phone: '+1 (555) 234-5678',
    joinDate: '2023-03-20',
    roles: [mockRoles['trainer']],
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdBy: 'admin@gymfit.com'
  },
  'member@gymfit.com': {
    id: '3',
    email: 'member@gymfit.com',
    name: 'Emily Chen',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 345-6789',
    joinDate: '2023-06-10',
    roles: [mockRoles['member']],
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    createdBy: 'admin@gymfit.com'
  }
};

const RBACContext = createContext<RBACContextType | null>(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
};

export const RBACProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (authState.user) {
      const userWithRoles = mockUsersWithRoles[authState.user.email];
      setCurrentUser(userWithRoles || null);
    } else {
      setCurrentUser(null);
    }
  }, [authState.user]);

  const getUserPermissions = (): Permission[] => {
    if (!currentUser) return [];
    
    const rolePermissions = currentUser.roles.flatMap(role => role.permissions);
    const customPermissions = currentUser.customPermissions || [];
    const deniedPermissions = currentUser.deniedPermissions || [];
    
    const allPermissions = [...new Set([...rolePermissions, ...customPermissions])];
    return allPermissions.filter(permission => !deniedPermissions.includes(permission));
  };

  const hasPermission = (permission: Permission): boolean => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}` as Permission;
    return hasPermission(permission);
  };

  const logActivity = (action: string, resource: string, details?: Record<string, any>) => {
    if (!currentUser) return;

    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      resource,
      details: details || {},
      ipAddress: '127.0.0.1', // Mock IP
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };

    setAuditLogs(prev => [log, ...prev].slice(0, 1000)); // Keep last 1000 logs
    console.log('Audit Log:', log);
  };

  const value: RBACContextType = {
    currentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessResource
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

// Export roles and users for admin management
export { mockRoles, mockUsersWithRoles };
