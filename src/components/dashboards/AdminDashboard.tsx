import { useBranches } from '@/hooks/useBranches';
import { ModernAdminDashboard } from './ModernAdminDashboard';
import { NoBranchesWelcome } from '@/components/onboarding';

export const AdminDashboard = () => {
  const { branches, isLoading } = useBranches();

  // Show loading state while checking for branches
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen if admin has no branches
  if (!branches || branches.length === 0) {
    return <NoBranchesWelcome />;
  }

  // Show the regular dashboard if admin has branches
  return <ModernAdminDashboard />;
};
