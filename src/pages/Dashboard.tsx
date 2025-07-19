
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboards/ManagerDashboard';
import { StaffDashboard } from '@/components/dashboards/StaffDashboard';
import { TrainerDashboard } from '@/components/dashboards/TrainerDashboard';
import { MemberDashboard } from '@/components/dashboards/MemberDashboard';
import { mockMembers } from '@/mock/members';

export default function Dashboard() {
  const { authState } = useAuth();
  
  if (!authState.user) return null;
  
  switch (authState.user.role) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'team':
      // Check team role specialization
      switch (authState.user.teamRole) {
        case 'manager':
          return <ManagerDashboard />;
        case 'staff':
          return <StaffDashboard />;
        case 'trainer':
          return <TrainerDashboard />;
        default:
          return <StaffDashboard />; // Default to staff dashboard for team members
      }
    case 'member':
      const member = mockMembers.find(m => m.email === authState.user?.email);
      if (!member) {
        return (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Member Not Found</h1>
            <p className="text-muted-foreground">Could not find member profile for this account.</p>
          </div>
        );
      }
      return <MemberDashboard 
        memberId={member.id}
        memberName={member.fullName}
        memberAvatar={member.profilePhoto}
      />;
    default:
      return <div>Invalid role</div>;
  }
}
