import { useMemo } from 'react';
import { ClassCard } from '@/components/classes/ClassCard';
import { mockClassEnrollments } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useGymClasses } from '@/hooks/useSupabaseQuery';

export const MemberClassesPage = () => {
  const { toast } = useToast();
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  const { data: classes, isLoading: classesLoading } = useGymClasses();
  const memberEnrollments = mockClassEnrollments.filter(e => e.memberId === member?.id);

  const upcomingClasses = useMemo(() => {
    if (!classes) return [];
    const now = new Date();
    return classes
      .filter((gymClass: any) => 
        new Date(gymClass.start_time) > now && 
        gymClass.status === 'scheduled'
      )
      .sort((a: any, b: any) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [classes]);

  const handleEnroll = (classId: string) => {
    toast({
      title: 'Class Booked',
      description: 'You have successfully registered for this class.',
    });
  };

  const handleCancel = (classId: string) => {
    toast({
      title: 'Booking Cancelled', 
      description: 'Your class booking has been cancelled.',
    });
  };

  if (memberLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Member profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Classes</h1>
        <p className="text-muted-foreground">Book your fitness classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((gymClass: any) => {
            const isEnrolled = memberEnrollments.some(e => e.classId === gymClass.id);
            
            return (
              <ClassCard
                key={gymClass.id}
                gymClass={{
                  ...gymClass,
                  startTime: new Date(gymClass.start_time),
                  endTime: new Date(gymClass.end_time),
                  trainerName: gymClass.trainer_profiles?.name || 'TBA'
                }}
                onEnroll={handleEnroll}
                onCancel={handleCancel}
                isEnrolled={isEnrolled}
                userRole="member"
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No upcoming classes available.</p>
          </div>
        )}
      </div>
    </div>
  );
};