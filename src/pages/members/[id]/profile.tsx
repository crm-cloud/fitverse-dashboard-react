import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberProfileCard } from '@/components/member/MemberProfileCard';
import { mockMembers } from '@/mock/members';
import { useRBAC } from '@/hooks/useRBAC';

export const MemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const member = mockMembers.find(m => m.id === id);

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Member Not Found</h2>
        <p className="text-muted-foreground mb-4">The member you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/members')}>
          Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Member Profile</h1>
            <p className="text-muted-foreground">View member details and information</p>
          </div>
        </div>
        
        {hasPermission('members.edit') && (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Member
          </Button>
        )}
      </div>

      <MemberProfileCard member={member} />
    </div>
  );
};