export type Permission = 
  // User Management
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete' | 'users.export'
  // Role Management
  | 'roles.view' | 'roles.create' | 'roles.edit' | 'roles.delete'
  // Member Management
  | 'members.view' | 'members.create' | 'members.edit' | 'members.delete' | 'members.export'
  // Staff Management
  | 'staff.view' | 'staff.create' | 'staff.edit' | 'staff.delete'
  // Class Management
  | 'classes.view' | 'classes.create' | 'classes.edit' | 'classes.delete' | 'classes.schedule'
  // Equipment Management
  | 'equipment.view' | 'equipment.create' | 'equipment.edit' | 'equipment.delete'
  // Billing & Payments
  | 'billing.view' | 'billing.create' | 'billing.edit' | 'billing.process'
  // Analytics & Reports
  | 'analytics.view' | 'reports.view' | 'reports.export'
  // System Settings
  | 'settings.view' | 'settings.edit' | 'system.backup' | 'system.restore'
  // Branch Management
  | 'branches.view' | 'branches.create' | 'branches.edit' | 'branches.delete'
  // Notifications
  | 'notifications.view' | 'notifications.send'
  // Lead Management
  | 'leads.view' | 'leads.create' | 'leads.edit' | 'leads.delete' | 'leads.assign' | 'leads.export'
  // Referral Management
  | 'referrals.view' | 'referrals.create' | 'referrals.edit' | 'referrals.process' | 'referrals.export'
  // Feedback Management
  | 'feedback.view' | 'feedback.create' | 'feedback.edit' | 'feedback.delete' | 'feedback.respond' | 'feedback.export'
  // Task Management
  | 'tasks.view' | 'tasks.create' | 'tasks.edit' | 'tasks.delete' | 'tasks.assign';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  isSystem: boolean; // Cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

import { User } from './auth';

export interface UserWithRoles extends User {
  roles: RoleDefinition[];
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: string;
  updatedBy?: string;
  customPermissions?: Permission[]; // Additional permissions beyond role
  deniedPermissions?: Permission[]; // Explicitly denied permissions
}

export interface RBACContext {
  currentUser: UserWithRoles | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
  canAccessResource: (resource: string, action: string) => boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export';
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
