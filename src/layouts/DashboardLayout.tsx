
import { memo, useCallback, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EnhancedAppSidebar } from './EnhancedAppSidebar';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { LoadingState } from '@/components/LoadingState';
import { useTabVisibility } from '@/hooks/useTabVisibility';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const { authState } = useAuth();
  const { isLoadingPermissions } = useRBAC();
  const { isVisible } = useTabVisibility();
  const queryClient = useQueryClient();

  // Handle tab visibility changes
  useEffect(() => {
    if (isVisible) {
      // Optional: Refetch queries when tab becomes visible
      // queryClient.invalidateQueries({ refetchType: 'active' });
    }
  }, [isVisible, queryClient]);

  // Memoize the loading state to prevent unnecessary re-renders
  const isLoading = authState.isLoading || isLoadingPermissions;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState size="lg" text="Loading your workspace..." />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EnhancedAppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto" key={window.location.pathname}>
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
