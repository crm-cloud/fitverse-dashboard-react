import { useBranches } from '@/hooks/useBranches';
import { ModernAdminDashboard } from './ModernAdminDashboard';
import { NoBranchesWelcome, AdminGymSetup } from '@/components/onboarding';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/LoadingState';

export const AdminDashboard = () => {
  const { authState } = useAuth();
  const { branches, isLoading } = useBranches();
  const adminGymId = authState.user?.gym_id;

  // Show loading state while checking for branches
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState text="Loading dashboard..." />
      </div>
    );
  }

  // CRITICAL: Check if admin has no gym assigned
  if (!adminGymId) {
    return <AdminGymSetup 
      adminId={authState.user!.id} 
      onComplete={() => window.location.reload()} 
    />;
  }

  // Check if admin has gym but no branches
  if (!branches || branches.length === 0) {
    return <NoBranchesWelcome />;
  }

  // Show the regular dashboard if admin has branches
  return <ModernAdminDashboard />;
};
