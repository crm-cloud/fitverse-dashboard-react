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
    user?.role,  // Optional chaining to prevent errors
    userPermissions,
    user?.teamRole  // Optional chaining to prevent errors
  );
  
  // If user is not loaded yet, we can't determine access
  if (!user) {
    return {
      hasAccess: false,
      isLoading: true,
      shouldRedirect: false,
      redirectPath: ''
    };
  }

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
  // Hooks must be called unconditionally at the top level
  const { authState } = useAuth();
  const { hasAnyPermission, hasAllPermissions, getUserPermissions } = useRBAC();
  const location = useLocation();
  const [showUnauthorizedToast, setShowUnauthorizedToast] = useState(false);
  const prevPathnameRef = useRef(location.pathname);
  
  // Call useAccessCheck unconditionally to maintain hook order
  const { hasAccess, userPermissions, isLoading: isAccessCheckLoading } = useAccessCheck({
    allowedRoles,
    requiredPermissions,
    requireAll,
    teamRole,
    excludeTeamRoles,
    pathname: location.pathname,
    user: authState.user || undefined,
    hasAllPermissions,
    hasAnyPermission,
    getUserPermissions
  });
  
  const isLoading = authState.isLoading || isAccessCheckLoading;
  
  // Track route access attempts for security audit
  useEffect(() => {
    if (trackAccess && authState.user && !isLoading) {
      console.log(`Route access: ${location.pathname} by ${authState.user.email} (${authState.user.role})`);
    }
  }, [location.pathname, authState.user, trackAccess, isLoading]);

  // Handle unauthorized access and path changes
  useEffect(() => {
    // Reset toast state when pathname changes
    if (location.pathname !== prevPathnameRef.current) {
      setShowUnauthorizedToast(false);
      prevPathnameRef.current = location.pathname;
    }
    
    // Show unauthorized message if needed
    if (!isLoading && !authState.isAuthenticated && !silent) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      });
    }
    
    // Show access denied message if needed
    if (!isLoading && authState.isAuthenticated && !hasAccess && showUnauthorizedMessage && !silent) {
      setShowUnauthorizedToast(true);
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
    }
  }, [location.pathname, isLoading, authState.isAuthenticated, hasAccess, showUnauthorizedMessage, silent]);
  
  // Show loading state while auth or access check is in progress
  if (isLoading) {
    return <PageLoadingState />;
  }
  
  // If user is not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Auto-redirect to default route if access is denied and autoRedirect is true
  if (!hasAccess && autoRedirect) {
    const defaultRoute = getDefaultRouteForUser(authState.user.role);
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