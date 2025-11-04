import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberProfileCard } from '@/components/member/MemberProfileCard';
import { useRBAC } from '@/hooks/useRBAC';
import { useMemberById } from '@/hooks/useMembers';
import { useBranches } from '@/hooks/useBranches';
import { Member } from '@/types/member';

export const MemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const { branches } = useBranches();
  const { data: row, isLoading, error } = useMemberById(id || '');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Loading member...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    );
  }

  if (error || !row) {
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

  // Map DB row to Member type expected by the card
  const branchNameFromList = branches.find(b => b.id === row.branch_id)?.name;
  const membershipPlan = row.membership_plan;
  let computedStatus = row.membership_status;
  if (!membershipPlan) {
    computedStatus = 'not-assigned';
  }

  const member: Member = {
    id: row.id,
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : new Date(),
    gender: row.gender,
    address: (row.address as any) ?? { street: '', city: '', state: '', pincode: '' },
    governmentId: (row.government_id as any),
    measurements: (row.measurements as any) ?? {},
    emergencyContact: (row.emergency_contact as any) ?? {},
    profilePhoto: row.profile_photo,
    branchId: row.branch_id,
    branchName: branchNameFromList ?? '—',
    membershipStatus: computedStatus ?? 'not-assigned',
    membershipPlan,
    trainerId: row.trainer_id,
    trainerName: undefined,
    joinedDate: row.joined_date ? new Date(row.joined_date) : (row.created_at ? new Date(row.created_at) : new Date()),
    createdBy: row.created_by ?? '',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    pointsBalance: 0,
    referralCodeUsed: undefined,
  };

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