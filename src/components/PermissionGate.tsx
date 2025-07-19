
import { ReactNode } from 'react';
import { Permission } from '@/types/rbac';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  resource?: string;
  action?: string;
  allowedRoles?: string[];
  restrictToRoles?: string[];
}

export const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  resource,
  action,
  allowedRoles,
  restrictToRoles
}: PermissionGateProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } = useRBAC();
  const { authState } = useAuth();

  let hasAccess = true;

  // Check role-based access first
  if (allowedRoles && authState.user) {
    hasAccess = allowedRoles.includes(authState.user.role);
  }

  if (restrictToRoles && authState.user) {
    hasAccess = hasAccess && restrictToRoles.includes(authState.user.role);
  }

  // Then check permissions if access is still granted
  if (hasAccess) {
    if (resource && action) {
      hasAccess = canAccessResource(resource, action);
    } else if (permission) {
      hasAccess = hasPermission(permission);
    } else if (permissions) {
      hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
