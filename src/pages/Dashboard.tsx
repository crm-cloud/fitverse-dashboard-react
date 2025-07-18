
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboards/ManagerDashboard';
import { StaffDashboard } from '@/components/dashboards/StaffDashboard';
import { TrainerDashboard } from '@/components/dashboards/TrainerDashboard';
import { MemberDashboard } from '@/components/dashboards/MemberDashboard';

export default function Dashboard() {
  const { authState } = useAuth();
  
  if (!authState.user) return null;
  
  switch (authState.user.role) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'member':
      return <MemberDashboard />;
    default:
      return <div>Invalid role</div>;
  }
}
