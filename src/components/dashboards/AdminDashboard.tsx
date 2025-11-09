import { useBranches } from '@/hooks/useBranches';
import { ModernAdminDashboard } from './ModernAdminDashboard';
import { NoBranchesWelcome, AdminGymSetup } from '@/components/onboarding';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/LoadingState';

export const AdminDashboard = () => {
  const { authState } = useAuth();
  const { branches, isLoading } = useBranches();
  const adminGymId = authState.user?.gym_id;

  console.log('🏢 [AdminDashboard] Rendering:', {
    hasGymId: !!adminGymId,
    gymId: adminGymId,
    branchesCount: branches?.length,
    isLoading
  });

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
    console.log('🏢 [AdminDashboard] No gym_id found, showing AdminGymSetup');
    return <AdminGymSetup 
      adminId={authState.user!.id} 
      onComplete={() => {
        console.log('✅ [AdminDashboard] Setup completed, reloading...');
        window.location.reload();
      }} 
    />;
  }

  // Check if admin has gym but no branches
  if (!branches || branches.length === 0) {
    console.log('🏢 [AdminDashboard] Gym exists but no branches, showing welcome');
    return <NoBranchesWelcome />;
  }

  // Show the regular dashboard if admin has branches
  console.log('🏢 [AdminDashboard] Showing full dashboard');
  return <ModernAdminDashboard />;
};
