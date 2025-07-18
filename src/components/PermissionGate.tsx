
import { ReactNode } from 'react';
import { Permission } from '@/types/rbac';
import { useRBAC } from '@/hooks/useRBAC';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  resource?: string;
  action?: string;
}

export const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  resource,
  action
}: PermissionGateProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } = useRBAC();

  let hasAccess = false;

  if (resource && action) {
    hasAccess = canAccessResource(resource, action);
  } else if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true; // No restrictions
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
