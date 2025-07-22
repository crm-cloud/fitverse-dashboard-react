import { MembershipPlanList } from '@/components/membership/MembershipPlanList';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/hooks/useRBAC';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const MembershipPlansPage = () => {
  const { hasPermission } = useRBAC();
  const navigate = useNavigate();

  if (!hasPermission('members.view')) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to view membership plans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">Manage membership plans and assign to members</p>
        </div>
        {hasPermission('members.create') && (
          <Button onClick={() => navigate('/membership/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member with Plan
          </Button>
        )}
      </div>
      <MembershipPlanList />
    </div>
  );
};