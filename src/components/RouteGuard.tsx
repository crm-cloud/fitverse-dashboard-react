import { ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';
import { PageLoadingState } from './LoadingState';
import { toast } from '@/hooks/use-toast';
import { getDefaultRouteForUser, isRouteAccessible } from '@/config/navigationConfig';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  teamRole?: string;
  excludeTeamRoles?: string[];
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
  // New props for enhanced functionality
  autoRedirect?: boolean; // If true, automatically redirect to user's default route
  silent?: boolean; // If true, don't show toast messages
  trackAccess?: boolean; // If true, log access attempts
}

const useAccessCheck = ({
  allowedRoles,
  requiredPermissions,
  requireAll,
  teamRole,
  excludeTeamRoles,
  pathname,
  user,
  hasAllPermissions,
  hasAnyPermission,
  getUserPermissions
}: {
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll: boolean;
  teamRole?: string;
  excludeTeamRoles?: string[];
  pathname: string;
  user: any; // Replace 'any' with your User type
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
}) => {
  const userPermissions = getUserPermissions();
  
  // Check if user has access to this route using centralized config
  const hasRouteAccess = isRouteAccessible(
    pathname,
    user.role,
    userPermissions,
    user.teamRole
  );

  // If route is not in navigation config, apply manual checks
  let hasManualAccess = true;

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    hasManualAccess = false;
  }

  // Check team role specificity
  if (teamRole && user.teamRole !== teamRole) {
    hasManualAccess = false;
  }

  // Check excluded team roles
  if (excludeTeamRoles && user.teamRole && excludeTeamRoles.includes(user.teamRole)) {
    hasManualAccess = false;
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      hasManualAccess = false;
    }
  }

  return {
    hasAccess: hasRouteAccess && hasManualAccess,
    userPermissions
  };
};

export const RouteGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  teamRole,
  excludeTeamRoles,
  redirectTo,
  showUnauthorizedMessage = true,
  autoRedirect = true,
  silent = false,
  trackAccess = true
}: RouteGuardProps) => {
  const { authState } = useAuth();
  const { hasAnyPermission, hasAllPermissions, getUserPermissions } = useRBAC();
  const location = useLocation();
  const [showUnauthorizedToast, setShowUnauthorizedToast] = useState(false);
  const prevPathnameRef = useRef(location.pathname);
  
  // Get user and check access at the top level to maintain hook order
  const user = authState.user;
  const { hasAccess, userPermissions } = useAccessCheck({
    allowedRoles,
    requiredPermissions,
    requireAll,
    teamRole,
    excludeTeamRoles,
    pathname: location.pathname,
    user: user || undefined,
    hasAllPermissions,
    hasAnyPermission,
    getUserPermissions
  });

  // Track route access attempts for security audit
  useEffect(() => {
    if (trackAccess && user) {
      console.log(`Route access: ${location.pathname} by ${user.email} (${user.role})`);
    }
  }, [location.pathname, user, trackAccess]);

  // Reset toast state when pathname changes
  useEffect(() => {
    if (location.pathname !== prevPathnameRef.current) {
      setShowUnauthorizedToast(false);
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return <PageLoadingState />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle unauthorized access
  useEffect(() => {
    if (!hasAccess && showUnauthorizedMessage && !silent) {
      // Only show the toast once per access denial
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
    }
  }, [hasAccess, showUnauthorizedMessage, silent, location.pathname]);

  // Auto-redirect to default route if access is denied and autoRedirect is true
  if (!hasAccess && autoRedirect) {
    const defaultRoute = getDefaultRouteForUser(user.role);
    if (defaultRoute && defaultRoute !== location.pathname) {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // If access is denied and no auto-redirect, show unauthorized or redirect
  if (!hasAccess) {
    return redirectTo ? (
      <Navigate to={redirectTo} state={{ from: location }} replace />
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export const withRouteGuard = (
  Component: React.ComponentType,
  guardProps: Omit<RouteGuardProps, 'children'>
) => {
  return (props: any) => (
    <RouteGuard {...guardProps}>
      <Component {...props} />
    </RouteGuard>
  );
};

// Utility function to create protected routes
export const createProtectedRoute = (
  component: React.ComponentType,
  guardConfig: Omit<RouteGuardProps, 'children'>
) => {
  return withRouteGuard(component, guardConfig);
};