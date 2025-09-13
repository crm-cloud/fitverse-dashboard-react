
import { SidebarProvider } from '@/components/ui/sidebar';
import { EnhancedAppSidebar } from './EnhancedAppSidebar';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EnhancedAppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
};
