import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberForm } from '@/components/member/MemberForm';
import { MemberFormData } from '@/types/member';
import { useToast } from '@/hooks/use-toast';

export const MemberCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (data: MemberFormData) => {
    // Mock API call
    console.log('Creating member:', data);
    
    toast({
      title: 'Member Created',
      description: `${data.fullName} has been successfully added as a member.`,
    });

    navigate('/members');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Member</h1>
          <p className="text-muted-foreground">Fill in the details to create a new member profile</p>
        </div>
      </div>

      <MemberForm onSubmit={handleSubmit} />
    </div>
  );
};