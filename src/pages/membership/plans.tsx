import { MembershipPlanList } from '@/components/membership/MembershipPlanList';
import { useRBAC } from '@/hooks/useRBAC';

export const MembershipPlansPage = () => {
  const { hasPermission } = useRBAC();

  if (!hasPermission('members.view')) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view membership plans.</p>
      </div>
    );
  }

  return <MembershipPlanList />;
};