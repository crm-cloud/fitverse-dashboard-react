import { useAuth } from './useAuth';

export interface OrganizationContext {
  organizationId?: string;
  branchId?: string;
  role?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTeamMember: boolean;
}

/**
 * Hook to get organization and branch context for the current user
 * Provides proper scoping for data queries based on user role
 */
export const useOrganizationContext = (): OrganizationContext => {
  const { authState } = useAuth();
  const user = authState.user;
  
  return {
    organizationId: user?.organization_id,
    branchId: user?.branchId,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'super-admin',
    isTeamMember: ['manager', 'staff', 'trainer'].includes(user?.role || ''),
  };
};
