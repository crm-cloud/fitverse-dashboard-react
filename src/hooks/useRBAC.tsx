
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permission, RoleDefinition, UserWithRoles, AuditLog, type RBACContext as RBACContextType } from '@/types/rbac';
import { useAuth } from './useAuth';

// Updated role definitions with role-specific permissions
const mockRoles: Record<string, RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Complete system access across all branches',
    color: '#dc2626',
    isSystem: true,
    scope: 'global',
    permissions: [
      'system.view', 'system.manage', 'system.backup', 'system.restore',
      'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.export',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
      'team.view', 'team.create', 'team.edit', 'team.delete',
      'classes.view', 'classes.create', 'classes.edit', 'classes.delete', 'classes.schedule',
      'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
      'finance.view', 'finance.create', 'finance.edit', 'finance.process',
      'analytics.view', 'reports.view', 'reports.export',
      'settings.view', 'settings.edit',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'pos.view', 'pos.process',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process',
      'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.delete', 'feedback.respond',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
      'notifications.view', 'notifications.send',
      'sms.view', 'sms.send', 'sms.templates.view', 'sms.templates.create', 'sms.templates.edit', 'sms.templates.delete',
      'sms.settings.view', 'sms.settings.edit', 'sms.providers.view', 'sms.providers.create', 'sms.providers.edit', 'sms.providers.delete',
      'sms.logs.view', 'sms.logs.export', 'sms.analytics.view',
      'trainer.schedule.view', 'trainer.schedule.manage', 'trainer.clients.view', 'trainer.clients.manage',
      'trainer.workouts.create', 'trainer.workouts.assign', 'trainer.progress.track', 'trainer.earnings.view',
      'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'admin': {
    id: 'admin',
    name: 'Administrator',
    description: 'Full operational access across all branches',
    color: '#ea580c',
    isSystem: true,
    scope: 'global',
    permissions: [
      'branches.view',
      'users.view', 'users.create', 'users.edit', 'users.export',
      'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export',
      'team.view', 'team.create', 'team.edit', 'team.delete',
      'classes.view', 'classes.create', 'classes.edit', 'classes.delete', 'classes.schedule',
      'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
      'finance.view', 'finance.create', 'finance.edit', 'finance.process',
      'analytics.view', 'reports.view', 'reports.export',
      'settings.view', 'settings.edit',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'pos.view', 'pos.process',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process',
      'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.delete', 'feedback.respond',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
      'notifications.view', 'notifications.send',
      'sms.view', 'sms.send', 'sms.templates.view', 'sms.templates.create', 'sms.templates.edit', 'sms.templates.delete',
      'sms.settings.view', 'sms.settings.edit', 'sms.providers.view', 'sms.providers.edit',
      'sms.logs.view', 'sms.logs.export', 'sms.analytics.view',
      'trainer.schedule.view', 'trainer.schedule.manage', 'trainer.clients.view', 'trainer.clients.manage',
      'trainer.workouts.create', 'trainer.workouts.assign', 'trainer.progress.track', 'trainer.earnings.view',
      'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-manager': {
    id: 'team-manager',
    name: 'Team Manager',
    description: 'Branch management and team oversight',
    color: '#0ea5e9',
    isSystem: true,
    scope: 'branch',
    permissions: [
      'members.view', 'members.create', 'members.edit', 'members.export',
      'team.view', 'team.create', 'team.edit',
      'classes.view', 'classes.create', 'classes.edit', 'classes.schedule',
      'equipment.view', 'equipment.edit',
      'finance.view', 'finance.edit',
      'analytics.view', 'reports.view',
      'products.view', 'products.edit',
      'pos.view', 'pos.process',
      'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'leads.export',
      'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.process',
      'feedback.view', 'feedback.create', 'feedback.edit', 'feedback.respond',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
      'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
      'notifications.view', 'notifications.send',
      'sms.view', 'sms.send', 'sms.templates.view', 'sms.logs.view',
      'trainer.schedule.view', 'trainer.clients.view', 'trainer.workouts.assign',
      'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-trainer': {
    id: 'team-trainer',
    name: 'Team Trainer',
    description: 'Trainer-specific access for classes and client management',
    color: '#16a34a',
    isSystem: true,
    scope: 'branch',
    permissions: [
      'members.view', 'members.edit',
      'classes.view', 'classes.create', 'classes.edit', 'classes.schedule',
      'equipment.view',
      'analytics.view',
      'products.view',
      'feedback.view', 'feedback.create', 'feedback.edit',
      'diet-workout.view', 'diet-workout.create', 'diet-workout.edit', 'diet-workout.assign',
      'trainer.schedule.view', 'trainer.schedule.manage', 'trainer.clients.view', 'trainer.clients.manage',
      'trainer.workouts.create', 'trainer.workouts.assign', 'trainer.progress.track', 'trainer.earnings.view'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-staff': {
    id: 'team-staff',
    name: 'Team Staff',
    description: 'Staff-specific access for front desk and member support',
    color: '#7c3aed',
    isSystem: true,
    scope: 'branch',
    permissions: [
      'members.view', 'members.create', 'members.edit',
      'classes.view',
      'equipment.view',
      'analytics.view',
      'products.view',
      'pos.view', 'pos.process',
      'leads.view', 'leads.create', 'leads.edit',
      'referrals.view', 'referrals.create',
      'feedback.view', 'feedback.create', 'feedback.respond',
      'tasks.view', 'tasks.create', 'tasks.edit',
      'staff.checkin.process', 'staff.support.handle', 'staff.orientation.conduct', 'staff.maintenance.report'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'member': {
    id: 'member',
    name: 'Member',
    description: 'Basic member access for personal use',
    color: '#dc2626',
    isSystem: true,
    scope: 'self',
    permissions: [
      'classes.view',
      'equipment.view',
      'finance.view',
      'products.view',
      'referrals.view', 'referrals.create',
      'feedback.create',
      'diet-workout.view'
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
};

// Updated mock users with role-specific assignments
const mockUsersWithRoles: Record<string, UserWithRoles> = {
  'superadmin@gymfit.com': {
    id: '0',
    email: 'superadmin@gymfit.com',
    name: 'David Thompson',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'System Administration',
    phone: '+1 (555) 000-0000',
    joinDate: '2022-01-01',
    roles: [mockRoles['super-admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'system',
    assignedBranches: ['all']
  },
  'admin@gymfit.com': {
    id: '1',
    email: 'admin@gymfit.com',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    department: 'Management',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    roles: [mockRoles['admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'superadmin@gymfit.com',
    assignedBranches: ['all']
  },
  'manager@gymfit.com': {
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
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-manager']],
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'admin@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'staff@gymfit.com': {
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
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-staff']],
    isActive: true,
    lastLogin: new Date(Date.now() - 60 * 60 * 1000),
    createdBy: 'manager@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'trainer@gymfit.com': {
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
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-trainer']],
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'manager@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'member@gymfit.com': {
    id: '5',
    email: 'member@gymfit.com',
    name: 'Emily Chen',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 345-6789',
    joinDate: '2023-06-10',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    roles: [mockRoles['member']],
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'staff@gymfit.com',
    primaryBranchId: 'branch_1'
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

  const canAccessBranch = (branchId: string): boolean => {
    if (!currentUser) return false;
    
    // Super Admin and Admin can access all branches
    if (currentUser.role === 'super-admin' || currentUser.role === 'admin') {
      return true;
    }
    
    // Team and Member are restricted to their assigned branch
    return currentUser.branchId === branchId;
  };

  const getCurrentBranchId = (): string | null => {
    return currentUser?.branchId || null;
  };

  const isTrainer = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'trainer';
  };

  const isStaff = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'staff';
  };

  const isManager = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'manager';
  };

  const value: RBACContextType = {
    currentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessResource,
    canAccessBranch,
    getCurrentBranchId,
    isTrainer,
    isStaff,
    isManager
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

// Export roles and users for admin management
export { mockRoles, mockUsersWithRoles };
